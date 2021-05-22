// API

var QRCode = require('qrcode')
// var API_URL = 'http://localhost:5000'; // The weebsite where this will be hosted
var API_URL = 'https://work--force-api.herokuapp.com'; // The weebsite where this will be hosted

var express = require('express');
var bodyParser = require('body-parser')
var app = express();

const BodyParser = require('body-parser');

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

// const User = require('./models/user');

var MongoClient = require('mongodb').MongoClient;
const dburl = "mongodb+srv://admin:admin@workforce-cluster.foz3q.mongodb.net/workforce-db?retryWrites=true&w=majority";
const dbname = 'workforce-db';
// const collname = 'workforce-col-test';
const collname = 'workforce-col';
const client = new MongoClient(dburl, { useNewUrlParser: true, useUnifiedTopology: true });

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
 

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Working
app.get('/', (req, res) => {
    res.send('The API is working!');
});

// QRCode.toString(`${API_URL}`,{type:'terminal'}, function (err, url) {
//     console.log(url)
// })

// Working
// https://stackoverflow.com/a/24557561
app.use(bodyParser.urlencoded({
    extended: true
}));
app.post('/api/register', (req, res) => {

    const {name, password, age, department, role} = req.query;

    // console.log(name+password+age);
    client.connect(err => {
        const collection = client.db(dbname).collection(collname);

        collection.insertOne({
            name:name,
            password:password, //The password is being stored directly into the database. This is a security threat but can be overcomed with using hashing and then using the has to compare while log in.
            age:age,
            department: department,
            role: role,
            last_equipment_checkedin:null,
            time_updated:null
        }, 
        function(err, result) {
            if (err) throw err;

            return res.json({
                success: true,
                message: 'Created new user',
            });

            // QRCode.toString(`${API_URL}/api/update/${name}/${age}/${department}/`,{type:'svg'}, function (err, url) {
            //     // console.log(url)
            //     return res.json({
            //         success: true,
            //         qr_code: url,
            //         message: 'Created new user',
            //     });
            // })
            // client.close();
            // res.json(result);
        });
    })
});

// Working
app.post('/api/authenticate', (req, res) => {
    // REF: https://stackoverflow.com/a/6913287
    // var {username, password} = req.body;
    var {username, password} = req.query;
    // username = req.query.username
    // password = req.query.password

    console.log(username+password);

    client.connect(err => {
        const collection = client.db(dbname).collection(collname);

        collection.findOne({name: username},(err, found) => {
            if(err){
                res.send(err);
            }
            else if(!found){
                res.send('User not found');
            }
            else if(found.password !== password){
                res.send('Wrong Password');
            }
            else{
                return res.json({
                    success: true,
                    message: 'Authenticated successfully',
                    role: found.role,
                    department: found.department
                });
            }
        });
    })
});

app.get('/api/update/:name/:age/:department/:last_department_checkedin/:last_equipment_checkedin', (req, res) => {            
    const {name,age,department,last_department_checkedin, last_equipment_checkedin} = req.params;
    
    // console.log(last_department_checkedin+last_equipment_checkedin);
    // http://localhost:5000/api/update/testuser7/45/electrical/power_department/forklift

    client.connect(err => {

        var dbo = client.db(dbname)
        var collection = dbo.collection(collname);
        var date = new Date()

        var update_time = `${date.getDate()}:${date.getMonth()+1}:${date.getFullYear()}  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

        var check_criteria = { name: name,age: age,department:department};
        var update_data = { $set: {last_department_checkedin: last_department_checkedin, last_equipment_checkedin: last_equipment_checkedin, time_updated:update_time} };
        
        collection.updateOne(check_criteria, update_data, function(error, result) {
            if (err) throw err;
            // write HTML output
            

            // Send output
            return res.json({
                success: true,
                message: `Updated record: <== Name: ${name}; Age: ${age}; Department: ${department}; last_department_checkedin: ${last_department_checkedin}; last_equipment_checkedin: ${last_equipment_checkedin} ==>`,
            });
        });
    });
});

// Working
app.post('/api/db', (req, res) => {
    const {role, department} = req.query;
    
    // console.log(role+department)

    if(role == 'ceo'){
        client.connect(err => {
            const collection = client.db(dbname).collection(collname);
            collection.find({}).toArray(function(error, result) {
                if (err) throw err;
                // write HTML output
                var output = 
                    '<table border="1"><tr>' + 
                        '<td><b>name</b></td>'+
                        '<td><b>age</b></td>' + 
                        '<td><b>department</b></td>'+
                        '<td><b>password</b></td>' +
                        '<td><b>role</b></td>'+
                        '<td><b>last_equipment_checkedin</b></td>' +
                        '<td><b>time_updated</b></td>' +
                    '</tr>';
    
                // process todo list
                result.forEach(function(result){
                    output += `<tr>`+
                        `<td>${result.name}</td>`+
                        `<td>${result.age}</td>`+
                        `<td>${result.department}</td>`+
                        `<td>${result.password}</td>`+
                        `<td>${result.role}</td>`+
                        `<td>${result.last_equipment_checkedin}</td>`+
                        `<td>${result.time_updated}</td>`+
                        `</tr>`
                });

                output += '</table>'

                res.send(output)
            });
        });
    }
    else if(role == 'supervisor'){
        client.connect(err => {
            const collection = client.db(dbname).collection(collname);
            collection.find({}).toArray(function(error, result) {
                if (err) throw err;
                // write HTML output
                var output = 
                    '<table border="1"><tr>' + 
                        '<td><b>name</b></td>'+
                        '<td><b>age</b></td>' + 
                        '<td><b>department</b></td>'+
                        '<td><b>password</b></td>' +
                        '<td><b>role</b></td>'+
                        '<td><b>last_equipment_checkedin</b></td>' +
                        '<td><b>time_updated</b></td>' +
                    '</tr>';
    
                // process todo list
                result.forEach(function(result){
                    if(result.department == department){
                        output += `<tr>`+
                        `<td>${result.name}</td>`+
                        `<td>${result.age}</td>`+
                        `<td>${result.department}</td>`+
                        `<td>${result.password}</td>`+
                        `<td>${result.role}</td>`+
                        `<td>${result.last_equipment_checkedin}</td>`+
                        `<td>${result.time_updated}</td>`+
                        `</tr>`
                    }
                });

                output += '</table>'

                res.send(output)
            });
        });
    }
    else{
        res.send('Sorry! Employee page is still under construction')
    }
});

// var date = new Date()
// console.log(`${date.getDate()}:${date.getMonth()+1}:${date.getFullYear()}  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)



// Working web
app.get('/test/:test', (req, res) => {
    console.log('The API is working!' + req.params.test);
    res.send('The API is working with params: ' + req.params.test);
});


// Working web
app.get('/api/log', (req, res) => {
    
    client.connect(err => {
        const collection = client.db(dbname).collection(collname);
        collection.find({}).toArray(function(error, result) {
            if (err) throw err;
            // write HTML output
            var output = '<html><header><title>Database Viewer</title></header><body>';

            output += '<h1>Database Viewer</title></h1>';
            output += 
                '<table border="1"><tr>' + 
                    '<td><b>name</b></td>'+
                    '<td><b>age</b></td>' + 
                    '<td><b>department</b></td>'+
                    '<td><b>password</b></td>' +
                    '<td><b>role</b></td>' +
                    '<td><b>last_equipment_checkedin</b></td>' +
                    '<td><b>time_updated</b></td>' +
                '</tr>';

            // process todo list
            result.forEach(function(result){
                output += `<tr>`+
                    `<td>${result.name}</td>`+
                    `<td>${result.age}</td>`+
                    `<td>${result.department}</td>`+
                    `<td>${result.password}</td>`+
                    `<td>${result.role}</td>`+
                    `<td>${result.last_equipment_checkedin}</td>`+
                    `<td>${result.time_updated}</td>`+
                    `</tr>`
            });

            // write HTML output (ending)
            output += '</table></body></html>'

            // send output back
            res.send(output);

            // res.send(result);
            // console.log(result);
        });
    });
});

/* OLD CODE

// Working web
app.get('/api/log', (req, res) => {
    
    client.connect(err => {
        const collection = client.db(dbname).collection(collname);
        collection.find({}).toArray(function(error, result) {
            if (err) throw err;
            // write HTML output
            var output = '<html><header><title>Database Viewer</title></header><body>';

            output += '<h1>Database Viewer</title></h1>';
            output += 
                '<table border="1"><tr>' + 
                    '<td><b>name</b></td>'+
                    '<td><b>age</b></td>' + 
                    '<td><b>department</b></td>'+
                    '<td><b>supervisor</b></td>' +
                    '<td><b>duties</b></td>'+
                    '<td><b>license</b></td>' +
                    '<td><b>last_department_checkedin</b></td>'+
                    '<td><b>last_equipment_checkedin</b></td>' +
                    '<td><b>time_updated</b></td>' +
                '</tr>';

            // process todo list
            result.forEach(function(result){
                output += `<tr>`+
                    `<td>${result.name}</td>`+
                    `<td>${result.age}</td>`+
                    `<td>${result.department}</td>`+
                    `<td>${result.supervisor}</td>`+
                    `<td>${result.duties}</td>`+
                    `<td>${result.license}</td>`+
                    `<td>${result.last_department_checkedin}</td>`+
                    `<td>${result.last_equipment_checkedin}</td>`+
                    `<td>${result.time_updated}</td>`+
                    `</tr>`
            });

            // write HTML output (ending)
            output += '</table></body></html>'

            // send output back
            res.send(output);

            // res.send(result);
            // console.log(result);
        });
    });
});


//Working
app.post('/api/register/:name/:password/:age/:department/:supervisor/:duties/:license', (req, res) => {   
    const {name,age,department,supervisor,duties,license } = req.params; 

    // console.log(user);
    client.connect(err => {
        const collection = client.db(dbname).collection(collname);

        collection.insertOne({
            name:name,
            age:age,
            department: department,
            supervisor:supervisor,
            duties:duties,
            license:license,
            last_department_checkedin:null,
            last_equipment_checkedin:null,
            time_updated:null
        }, 
        function(err, result) {
            if (err) throw err;

            QRCode.toString(`${API_URL}/api/update/${name}/${age}/${department}/`,{type:'svg'}, function (err, url) {
                // console.log(url)
                return res.json({
                    success: true,
                    qr_code: url,
                    message: 'Created new user',
                });
            })
            // client.close();
            // res.json(result);
        });
    })
});


*/
