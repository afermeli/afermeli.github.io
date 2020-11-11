
THREE = require("three")
const orbit = require('three-orbitcontrols')
var path = require('path')
var express = require('express');
var async = require('async');
const colors = require('colors/safe');
var bodyParser = require('body-parser');
var arangojs = require("arangojs");
//var THREE = require('three');
var app = express();
var http = require('http').createServer(app);
var fs = require('fs');
var io = require('socket.io')(http);
//var ForceGraph3D = require('3d-force-graph');



//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//--------------------------//
// ArangoDB Database Access //
//--------------------------//

// Connect to ArangoDB
Database = require('arangojs').Database;
gr = new Database('http://cedegemac8.epfl.ch:8529');
gr.useBasicAuth('afermeli', 'ga67DbkqJW54eVWx');

// Connect to database
gr.useDatabase('Campus_Analytics');

// Get collection
//Nodes_N_Course = gr.collection('Nodes_N_Course');
//Nodes_N_Concept = gr.collection('Nodes_N_Concept')
//Edges = gr.collection('Edges_N_Course_N_Concept_T_Semiauto')

//Nodes_N_Course.all().then(x => x._result)
//console.log(Nodes_N_Course)
//--------------------------//
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
/*io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.emit('data', 1000)
            /*Nodes_N_Course.all().then(cursor => {
            socket.emit('data', cursor._result)
        })

    /*Nodes_N_Course.all().then( cursor => {
        socket.emit('data', cursor)
    });
});*/

/*http.listen(3000, () => {
    console.log('listening on *:3000');
});*/

//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa


// Static folder
app.use(express.static(__dirname + '/static'));

/*Nodes_N_Course.all().then( cursor => {
    var result = cursor._result
    let i = 0
    while(cursor.hasNext()) {
        cursor.next( (err, val) => {
            console.log(i)
            ++i
            // use val to throw it to a queue
            //console.log(typeof val)
            //result.push(val)
        })
    }
    console.log(result.length)
})*/

//app.use(express.bodyParser());
//Nodes_N_Course.setBatchSize(1500)
app.get('/graph', function(req, res){
    /*Nodes_N_Course.all().then( cursor => {
        console.log(cursor.hasNext())
        Nodes_N_Concept.all().then(cursor1 => {
            Edges.all().then(cursor2 => {
                res.send({courses : cursor, concepts: cursor1, edges: cursor2})
            })
        })
        //res.send(cursor)
    })*/


    //res.send({'courses' : courses, 'concepts' : concepts})



    var courses = []
    var edges = []
    var concepts = []
    var done1 = false
    var done2 = false
    var done3 = false
    var sent = false
    gr.query('FOR d IN Nodes_N_Concept FILTER TO_NUMBER(d._key) < 10000 RETURN {_id: d._id, _key: d._key}').then(cursor => {
        cursor.each(val => {
            concepts.push(val)
        }).then(val => {
            //while(tab.length < 2900){}
            done3 = true
            if(done2 && done1 && !sent) {
                sent = true
                res.send({courses : courses, concepts: concepts, edges: edges})}
            //res.send(tab)
        })
        done3 = true
    })
    gr.query('FOR d IN Nodes_N_Course RETURN {_id: d._id, _key: d._key}').then(cursor => {
        //Nodes_N_Course.all().then(cursor => {
        cursor.each(val => {
            courses.push(val)
        }).then(val => {
            //while(tab.length < 2900){}
            done1 = true
            if(done2 && done3 && !sent) {
                sent = true
                res.send({courses : courses, concepts: concepts, edges: edges})
                    }
            //res.send(tab)
        })
    })
    gr.query('FOR d IN Edges_N_Course_N_Concept_T_Semiauto RETURN {_from: d._from, _to: d._to}').then(cursor1 => {
        cursor1.each(val => {
            edges.push(val)
        }).then(val => {
            done2 = true
            if(done1 && done3 && !sent) {
                sent = true
                res.send({courses : courses, concepts: concepts, edges: edges})
                    }
        })
    })

});

app.get('/endpoint', function(req, res){
    var courses = {'key' : 'k'};
    var concepts = {'0' : 'maths', '1' : 'bio', '2' : 'computer science', '3' : 'psychology', '4' : 'civil'}
    for(var i = 0; i < 10; ++i) {
        //courses.add({i : "course n°" + i})
        var course = {'number' : i.toString()}
        course.concept1 = concepts[((i + 1) % 5).toString()]
        course.concept2 = concepts[((i*i) % 5).toString()]
        courses[i] = course //i.toString()
    }
    //obj.title = 'title';
    //obj.data = 'data';
    res.send({'courses' : courses, 'concepts' : concepts})
    //res.sendFile(path.join(__dirname + '/index1.html'));
});

app.post('/endpoint', function(req, res){
    //var obj = {};
    //console.log('body: ' + JSON.stringify(req.body));
    //res.send(req.body);
    console.log(req.body.code)
});

// POST handle
app.post('/graph/func', function(req, res) {

    console.log(req.body)

// Create temporary document
    doc = {
        '_id'     : 'Sequences/temp',
        'Sequence' : req.body['...']
    };


    gr.collection('Nodes_N_Course').document('temp').then(
        doc => {
// ...

        },
        err => console.error('Failed to fetch temporary document.', err)
    );

});




// GET Callback: Node attribute
app.get('/graph/getfunc/:collection/:node/:attribute', function(req, res) {

// Get URL parameters from client
    var collection = req.params.collection.toString();
    var node = {"_key" : req.params.node.toString()};
    var attribute = req.params.attribute.toString();

// Print request
    console.log(colors.green('[GET]')+' Collection: '+colors.blue(collection)+', Node: '+colors.blue(node)+', Attribute: '+colors.blue(attribute));
    var result
    gr.collection(collection).all().then(
// Build data array
        cursor => {

            res.send(cursor._result)
            //result = cursor//.map(x => x['_result'])
            //console.log(result)
            //res.send(cursor.map(doc => doc['_result']))
            //res.send(cursor.map(x => x['_result']))
            }
    )//.then(
// Send data to client0§
//               //data => res.send(data),
       // err => console.error('Failed to fetch all documents:', err)
    //);
    //console.log(result)
    //console.log("aaaaaaaaaaaaaaaaaaaaaa")

    /*gr.collection(collection).document(node).then(
// Send data to client
        doc => //res.send(doc[attribute]),
        err => console.error('Failed to fetch all documents:', err)
    );*/
});



// Root method
app.get('/', function(req, res) {
    //console.log("yes yes !")
    //res.setHeader("Content-Type", "text/javascript");


        var tab = []
        let i = 0
        /*cursor.each(val => {
            console.log(i)
            ++i
            tab.push(val)
        }).then(console.log(tab.length))*/
        gr.query('FOR d IN Nodes_N_Course RETURN {_id: d._id, _key: d._key}').then(cursor => {
        //Nodes_N_Course.all().then(cursor => {
            cursor.each(val => {
                console.log(i)
                ++i
                tab.push(val)
            }).then(val => {
                //while(tab.length < 2900){}
                res.send(tab)
            })
        })
        //while(tab.length < 2900) {}



    //res.send(Nodes_N_Course)
    //res.sendFile(path.join(__dirname + '/index2.html'));
    //res.send("hahahahahhaha");
});

    app.listen(8081);
console.log('Listening on http://127.0.0.1:8080/')