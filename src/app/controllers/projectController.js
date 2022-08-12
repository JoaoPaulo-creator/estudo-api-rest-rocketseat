const express = require('express')
const router = express.Router()
const Project = require('../models/project')
const Task = require('../models/task')

const authMiddleware = require('../middlewares/auth')

router.use(authMiddleware)

router.get('/', async (req, res) =>{
    try {
        //populate('user') vai mostrar os nomes dos usuários e informações das tasks
        const projects = await Project.find().populate(['user', 'tasks'])
        return res.send({ projects })
    } catch (error) {
        return res.status(400).send({ error: 'Erro loading projects' })
    }
})

router.get('/:projectId', async (req, res) =>{
    try {
        //populate('user') vai mostrar os nomes dos usuários
        const projects = await Project.findById(req.params.projectId).populate(['user', 'tasks'])
        return res.send({ projects })
    } catch (error) {
        return res.status(400).send({ error: 'Erro loading project' })
    }
})

router.post('/', async (req, res) => {    
    try {
        const { title, description, tasks } = req.body
        const  project = await Project.create({ title, description, user: req.userId })

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })
            await projectTask.save()
            project.tasks.push(projectTask)
        }))

        await project.save()
        return res.status(200).send({ project })
    } catch (err) {
        return res.status(400).send({ error: 'Error while creating new project.'})
    }
})

router.put('/:projectId', async (req, res) =>{
    try {
        const { title, description, tasks } = req.body
        //adicionado new: true, para que o mongoose retorne valores atualizados
        // sem new: true, o mongoose não vai retornar os valores que foram atualizados
        const  project = await Project.findByIdAndUpdate(req.params.projectId, { 
            title,
            description            
        }, { new: true })

        project.tasks = []
        await Task.deleteMany({ project: project._id})

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id })
            await projectTask.save()
            project.tasks.push(projectTask)
        }))

        await project.save()
        return res.status(200).send({ project })
    } catch (err) {
        return res.status(400).send({ error: 'Error while updating project.'})
    }
})

router.delete('/:projectId', async (req, res) =>{
    try {        
        await Project.findByIdAndRemove(req.params.projectId)
        return res.send()
    } catch (error) {
        return res.status(400).send({ error: 'Error deleting project' })
    }
})

module.exports = app => app.use('/projects', router)