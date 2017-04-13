var Box2D = require('./box2d.js');
var server = require('./physicServer.js')
var PhysicWorld = require("../playground/classObject.js");
var world;
var gameElements = [];
var scale = 30;

var size = 50;
var w = 900, h = 500;
var fps = 30;
var interval;

console.log("oooooo ", dunya.getGravity());

var PI2 = Math.PI * 2;

// Multiply to convert degrees to radians.
var D2R = Math.PI / 180;

// Multiply to convert radians to degrees.
var R2D = 180 / Math.PI;

var debug = false;

// Shorthand "imports"
var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2AABB = Box2D.Collision.b2AABB,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
    b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;


var startEnv = () => {

    world = new b2World(new b2Vec2(0, 10), true);

    //create area
    createArea(0, 0, w, 5, true);
    createArea(0, h, w, 5, true);
    createArea(0, 0, 5, h, true);
    createArea(w, 0, 5, h, true);

    createBox(210, 400, 25, 25, false, false);
    createBox(200, 249, 25, 25, false, false);
    createBox(350, 120, 25, 25, false, false);
    
   

    interval = setInterval(() => {
        update();
    }, 1000 / fps);

    update();

}

var update = () => {

    world.Step(1 / fps, 10, 10);

    gameElements = gameStep();

    server.emitPositions(gameElements);

    world.ClearForces();

}

var gameStep = () => {

    var elements = [];
    var i = 0;
    for (var b = world.m_bodyList; b; b = b.m_next) {
        for (var f = b.m_fixtureList; f; f = f.m_next) {

            if (f.m_body.m_userData) {

                var x = Math.floor(f.m_body.m_xf.position.x * scale);
                var y = Math.floor(f.m_body.m_xf.position.y * scale);
                var r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;
                var width = f.m_body.m_userData.width;
                var height = f.m_body.m_userData.height;
                var static = f.m_body.m_userData.static;

                var gameObj = {

                    x: x,
                    y: y,
                    r: r,
                    w: width,
                    h: height,
                    s: static
                }

                elements.push(gameObj);

            }

        }
    }

    console.log(elements);

    return { elements: elements };

}

var createBox = (x, y, w2, h2, static, circle) => {

    var bodyDef = new b2BodyDef;
    bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
    bodyDef.position.x = x / scale;
    bodyDef.position.y = y / scale;
    bodyDef.userData = { width: w2, height: h2, static: static };

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.5;
    fixDef.friction = 0.5;
    fixDef.restitution = 1;

    if (circle) {
        var circleShape = new b2CircleShape;
        circleShape.m_radius = w2 / scale;
        fixDef.shape = circleShape;
    } else {
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(w2 / scale, h2 / scale);
    }

    return world.CreateBody(bodyDef).CreateFixture(fixDef);

}

var createArea = (x, y, w2, h2, static) => {
    var bodyDef = new b2BodyDef;
    bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
    bodyDef.position.x = x / scale;
    bodyDef.position.y = y / scale;

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.5;
    fixDef.friction = 0.2;
    fixDef.restitution = 1;

    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(w2 / scale, h2 / scale);

    return world.CreateBody(bodyDef).CreateFixture(fixDef);
}


module.exports = {

    startEnv

}