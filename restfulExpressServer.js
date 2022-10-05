const express = require('express');
const app = express();
const PORT = 4000;
const morgan = require('morgan');
const {Client} = require('pg');
const config = require('./config.json')[process.env.NODE_ENV||"dev"] 
app.use(express.json());
app.use(morgan());

// const connectString = 'postgresql://postgres:docker@localhost:5432/my_pet_shop';

const client = new Client ({
    connectionString: config.connectionString,
});

client.connect();

//Request for root entry to site
app.get('/', (req, res) =>{
    res.send('Welcome to the petshop');
})

//Request to get entire database
app.get('/pets', (req, res) =>{
    client.query('SELECT * FROM pets')
    .then(result => {
        res.send(result.rows);
    });
})

//Request pet by ID
app.get(`/pets/:id`, (req, res) =>{
    client.query(`SELECT * FROM pets WHERE id = ${req.params.id}`)
    .then(result => {
        console.log(result.rows);
        if(result.rows.length == 0){
            res.status(404);
            res.send('Pet doesn\'t exist');
            return;
        }
        res.send(result.rows);
        res.end();
    })
})


//Request to add a pet
app.post('/pets', (req, res) => {
    let petsInfo = req.body
    if(petsInfo.age && petsInfo.name && petsInfo.kind && typeof petsInfo.age == 'number' && petsInfo.age.length != 0 && petsInfo.kind.length != 0 && petsInfo.name.length != 0){
        client.query(`INSERT INTO pets (pet_name, age, kind) VALUES ('${petsInfo.name}', ${petsInfo.age}, '${petsInfo.kind}')`,
        (err) => {
            if(err){
                console.error(err);
                res.status(404);
            } else {
                let petString = JSON.stringify(petsInfo);
                res.send(`Pet data added: ${petString}`);
            }
        });
    } else {
        res.status(404);
        res.send('404 error: Bad Request provide: age | kind | name');
    }  
});

//Request to patch/update info in table
app.patch('/pets/:id', (req,res) =>{
    let petUpdate = req.body;
    if(typeof petUpdate.age == 'number' && petUpdate.age.length != 0 && petUpdate.kind.length != 0 && petUpdate.name.length != 0){
        client.query(`UPDATE pets SET pet_name = '${petUpdate.name}', age = ${petUpdate.age}, kind = '${petUpdate.kind}' WHERE id = ${req.params.id}`)
        .then(result=>{
            res.status(200)
            let petString = JSON.stringify(petUpdate);
            res.send(`Pet updated to: ${petString}`);
        })
    } else {
        res.status(404);
        res.send('404 error: Bad Request provide: age | kind | name');
    }
})

//Request for deleting a pet
app.delete('/pets/:id', (req, res) => {
    res.status(200);
    client.query(`SELECT * FROM pets WHERE id = ${req.params.id}`)
    .then(result => {
        console.log(result.rows);
        if(result.rows.length == 0){
            res.status(404);
            res.send('Pet doesn\'t exist');
            return;
        } else {
            let deletedPet = JSON.stringify(result.rows);
            res.send(`Pet Thanos snapped: ${deletedPet}`);
            client.query(`DELETE FROM pets WHERE id = ${req.params.id}`);
        }
    })
})

app.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
})