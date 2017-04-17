var Box2D = require('./box2d.js');
var s = require('./Server.js');

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

function World(world, gravity, velocity, name, room) {

    this._room = room;
    this._name = name;
    this._world = world;
    this._gravity = gravity;
    this._velocity = velocity;
    this._gameElements = {};
    this._scale = 10;
    this._interval;

    this._size = 50;
    this._w = 900;
    this._h = 500;
    this._fps = 60;
    this._inteval;

    this._PI2 = Math.PI * 2;
    this._D2R = Math.PI / 180;
    this._R2D = 180 / Math.PI;
    this._debug = false;

}

World.prototype.addContactListener = function () {

    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.BeginContact = function (contact) {
        // console.log(contact.GetFixtureA().GetBody().GetUserData());

        if (contact.GetFixtureA().GetBody().GetUserData().userName == 'ball') {

            if(contact.GetFixtureB().GetBody().GetUserData().userName != ""){

                contact.GetFixtureB().GetBody().GetUserData().kick = true;

                console.log(contact.GetFixtureB().GetBody().GetUserData().kick);

            }

        }
        else if (contact.GetFixtureB().GetBody().GetUserData().userName == 'ball') {

             if(contact.GetFixtureA().GetBody().GetUserData().userName != ""){

                contact.GetFixtureA().GetBody().GetUserData().kick = true;

                console.log(contact.GetFixtureA().GetBody().GetUserData().kick);

             }

        }

    }
    listener.EndContact = function (contact) {
        // console.log(contact.GetFixtureA().GetBody().GetUserData());

        if (contact.GetFixtureA().GetBody().GetUserData().userName == 'ball') {

             if(contact.GetFixtureB().GetBody().GetUserData().userName != ""){

                contact.GetFixtureB().GetBody().GetUserData().kick = false;

                console.log(contact.GetFixtureB().GetBody().GetUserData().kick);

             }

        }
        else if (contact.GetFixtureB().GetBody().GetUserData().userName == 'ball') {

             if(contact.GetFixtureA().GetBody().GetUserData().userName != ""){

                contact.GetFixtureA().GetBody().GetUserData().kick = false;

                console.log(contact.GetFixtureA().GetBody().GetUserData().kick);

             }

        }

    }
    listener.PostSolve = function (contact, impulse) {

    }
    listener.PreSolve = function (contact, oldManifold) {

    }
    this._world.SetContactListener(listener);


}

World.prototype.startEnv = function () {

    this._world = new b2World(new b2Vec2(0, this._gravity), true);

    this.addContactListener();

    this.createArea(0, 0, this._w, 5, true);
    this.createArea(0, this._h, this._w, 5, true);
    this.createArea(0, 0, 5, this._h, true);
    this.createArea(this._w, 0, 5, this._h, true);

    this.createBox(2, 1, 450, 250, 12, 12, false, true, 'ball', 'ball');
    this.createBox(2, 1, 250, 250, 25, 25, false, true, 'blue', 'anilgulgor');
    this.createBox(2, 1, 650, 250, 25, 25, false, true, 'red', 'birtangultekin');

    this._inteval = setInterval(() => {

        this.update();

    }, 1000 / this._fps);

    this.update();

}

World.prototype.update = function () {

    this._world.Step(1 / this._fps, this._gravity, this._velocity);

    this._gameElements = this.gameStep();

    s.emitObjectsToClients(this._room.name, this._gameElements);

    //console.log(this._gameElements + "name : " + this._name);

    this._world.ClearForces();

}

World.prototype.gameStep = function () {

    var elements = [];
    var i = 0;
    for (var b = this._world.m_bodyList; b; b = b.m_next) {
        for (var f = b.m_fixtureList; f; f = f.m_next) {

            if (f.m_body.m_userData) {

                if(f.m_body.m_userData.userName != ""){

                var x = Math.floor(f.m_body.m_xf.position.x * this._scale);
                var y = Math.floor(f.m_body.m_xf.position.y * this._scale);
                var r = Math.round(((f.m_body.m_sweep.a + this._PI2) % this._PI2) * this._R2D * 100) / 100;
                var width = f.m_body.m_userData.width;
                var height = f.m_body.m_userData.height;
                var static = f.m_body.m_userData.static;
                var type = f.m_body.m_userData.type;

                var gameObj = {

                    x: x,
                    y: y,
                    r: r,
                    w: width,
                    h: height,
                    s: static,
                    t: type
                }

                elements.push(gameObj);

            }

            }

        }
    }

    //console.log(elements);

    return { elements: elements };

}

World.prototype.createBox = function (dam, d, x, y, w2, h2, static, circle, type, username) {

    var bodyDef = new b2BodyDef;
    bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
    bodyDef.position.x = x / this._scale;
    bodyDef.position.y = y / this._scale;
    bodyDef.userData = { width: w2, height: h2, static: static, type: type, userName: username, kick: false };
    bodyDef.allowSleep = true;
    bodyDef.linearDamping = dam;

    var body;
    body = this._world.CreateBody(bodyDef);

    var fixDef = new b2FixtureDef;
    fixDef.density = d;
    fixDef.friction = 0.15;
    fixDef.restitution = 0.2;

    if (circle) {
        var circleShape = new b2CircleShape;
        circleShape.m_radius = w2 / this._scale;
        fixDef.shape = circleShape;
    } else {
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(w2 / this._scale, h2 / this._scale);
    }

    var fix = new b2Fixture;
    fix = body.CreateFixture(fixDef);

    if(bodyDef.userData.userName != 'ball'){

        var bigFixDef = new b2FixtureDef;
        bigFixDef.isSensor = true;
        bigFixDef.shape = new b2CircleShape;
        bigFixDef.shape.m_radius = ( w2 * 2 ) / this._scale;

        var bigFix = new b2Fixture;
        bigFix = body.CreateFixture(bigFixDef);

    }

    return body;

}

World.prototype.applyForce = function (username, force) {

    for (var b = this._world.m_bodyList; b; b = b.m_next) {

        for (var f = b.m_fixtureList; f; f = f.m_next) {

            if (f.m_body.m_userData) {

                if (f.m_body.m_userData.userName == username) {

                    var forceVec = JSON.parse(force);

                    f.m_body.ApplyForce(new b2Vec2(forceVec.forceX*300, forceVec.forceY*300) , f.m_body.m_xf.position);

                    //f.m_body.SetLinearVelocity(new b2Vec2(forceVec.forceX * .5, forceVec.forceY * .5));

                    //console.log(forceVec.forceX + " " + forceVec.forceY);

                }

            }

        }

    }

}

World.prototype.getBodyWithName = function (username) {

    for (var b = this._world.m_bodyList; b; b = b.m_next) {

        for (var f = b.m_fixtureList; f; f = f.m_next) {

            if (f.m_body.m_userData) {

                if (f.m_body.m_userData.userName == username) {

                    return f.m_body;

                }

            }

        }

    }

}

World.prototype.kickBall = function (username) {

    for (var b = this._world.m_bodyList; b; b = b.m_next) {

        for (var f = b.m_fixtureList; f; f = f.m_next) {

            if (f.m_body.m_userData) {

                if (f.m_body.m_userData.userName == username) {

                    if (f.m_body.m_userData.kick == true) {

                        this.getBodyWithName('ball').ApplyForce(new b2Vec2(10000,0)
                         , f.m_body.m_xf.position);

                         console.log("VURDUUuuUuUUUUUUUUUUM");

                    }

                }

            }

        }

    }

}

World.prototype.createArea = function (x, y, w2, h2, static, type) {

    var bodyDef = new b2BodyDef;
    bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
    bodyDef.position.x = x / this._scale;
    bodyDef.position.y = y / this._scale;
    bodyDef.userData = { width: w2, height: h2, static: static, type: "", userName: "", kick: false };

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.5;
    fixDef.friction = 0.2;
    fixDef.restitution = 0.5;

    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(w2 / this._scale, h2 / this._scale);

    return this._world.CreateBody(bodyDef).CreateFixture(fixDef);

}

module.exports = World;