var express = require('express');
var bodyParser = require('body-parser')
var app = express();

const BodyParser = require('body-parser');

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

const User = require('./models/user');

var MongoClient = require('mongodb').MongoClient;
const dburl = "mongodb+srv://admin:admin@workforce-cluster.foz3q.mongodb.net/workforce-db?retryWrites=true&w=majority";
const dbname = 'workforce-db';
const collname = 'workforce-col-test';
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

// Working
app.post('/test/:test', (req, res) => {
    console.log('The API is working!' + req.params.test);
    res.send('The API is working!' + req.params.test);
});

// Working
app.get('/test', (req, res) => {
    res.send('The API is working!');
});

//Working
app.post('/api/register/:name/:age/:department/:supervisor/:duties/:license', (req, res) => {   
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
            last_equipment_checkedin:null
        }, 
        function(err, result) {
            if (err) throw err;
            res.json(result);
            client.close();
        });
    })
});

app.post('/api/devices', (req, res) => {
    const { name, user, sensorData } = req.body;
    
    const newDevice = new Device({
        name,
        user,
        sensorData
    });   

    newDevice.save(err => {
        return err
        ? res.send(err)
        : res.send('successfully added device and data');
    });
});


app.post('/api/authenticate', (req, res) => {
    
    const {user, password } = req.body;
    User.findOne({name: user},(err, found) => {
            if(err){
                res.send(err);
            }
            else if(!found){
                res.send('User not found.');
            }
            else if(found.password !== password){
                res.send('Password is wrong.');
                
            }
            else{
                return res.json({
                    success: true,
                    message: 'Authenticated successfully',
                    isAdmin: found.isAdmin
                });
            }
        });
});

// app.post('/api/register', (req, res) => {   
//     const {user, password } = req.body;    
//     User.findOne({name: user},(err, found) => {
//             if(err){
//                 res.send(err);
//             }
//             else if(found){
//                 res.send('User already found.');
//             }
//             else{
//                 const newUser = new User({
//                     name: user,
//                     password: password                    
//                 });
//                 newUser.save(err => {
//                     return res.json({
//                         success: true,
//                         message: 'Created new user'
//                         });
//                     });
//             }
//         });
// });


   
app.get('/api/devices/:deviceId/device-history', (req, res) => {            
            const { deviceId } = req.params;
            Device.findOne({"_id": deviceId }, (err, devices) => {
            const { sensorData } = devices;
            return err
            ? res.send(err)
            : res.send(sensorData);          
        });
});

app.get('/api/users/:user/devices', (req, res) => {
    const { user } = req.params;
    Device.find({ "user": user }, (err, devices) => {
        return err
        ? res.send(err)
        : res.send(devices);
    });
});