const axios = require('axios');
const { update } = require('../models/Dev');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket')

// index, show, store, update, destroy

module.exports = {

    async index (req, resp) {
        const devs = await Dev.find();

        return resp.json(devs);
    },

    async store (req, resp) {
        const { github_username, techs, latitude, longitude } = req.body;

        let dev = await Dev.findOne({github_username});

        if(!dev){
            const apiResp = await axios.get(`https://api.github.com/users/${github_username}`);
    
            const { name = login, avatar_url, bio } = apiResp.data;
        
            const techsArray = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location
            });

            // filtrar as conexoes que estao no maximo 10km e techs
            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray,
            )
            
            sendMessage(sendSocketMessageTo, 'newDev', dev)
        }

        return resp.json(dev);
    },

    /**
    async update(){},
    async destroy(){}     
     */    

};



/**
    query params: req.query (filtros, ordenação, paginação, ..)
    route params: req.params (identificar um recurso na alteração ou remoção)
    body: req.body (dados para criação ou alteração de um registro)

    data: resp.data (dados)
*/