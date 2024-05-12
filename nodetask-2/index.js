const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
// const 
const app = express();
const port = 3000;

// Database Details
const DB_USER = process.env['DB_USER'];
const DB_PWD = process.env['DB_PWD'];
const DB_URL = process.env['DB_URL'];
const DB_NAME = "task-jeff";
const DB_COLLECTION_NAME = "players";


// const uri = "mongodb+srv://"+DB_USER+":"+DB_PWD+"@"+DB_URL+"/?retryWrites=true&w=majority";
const uri = "mongodb://localhost:27017";

const client = new MongoClient("mongodb://localhost:27017");
let db, collection, matchCollection, myTeam;

async function run() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log("You successfully connected to MongoDB!");
    sampleCreate();
  } catch (e) {
    console.log(e);
  }
}

// Sample create document
async function sampleCreate() {
  //   let id
  //   const demo_doc = {
  //     "demo": "doc demo",
  //     "hello": "world"
  //   };
  collection = await db.collection(DB_COLLECTION_NAME)
  matchCollection = await db.collection('match')
  //   const demo_create = await db.collection(DB_COLLECTION_NAME).insertOne(demo_doc);

  //   console.log("Added!")
  //   console.log(id = demo_create.insertedId);
  //   console.log(await db.collection(DB_COLLECTION_NAME).deleteMany({ demo: "doc demo" }));

}

async function sameTeamPlayers(obj) {
  return await collection.find(obj).toArray();
}
async function sameTeamPlayers1() {
  return await collection.find().toArray();
}
async function processResult() {
  // console.log(await matchCollection.find().toArray());
  return await matchCollection.find().toArray();
}

// Endpoints
app.use(express.json())
app.get('/', async (req, res) => {
  res.send('Hello World!');
});
// Add Team
app.post('/add-team', async (req, res) => {
  let inDB = [], teamPlayer, player;
  try {
    // checks 11 members are list 
    if (req.body.Players.length == 11) {
      // check the players are in DB
      let isSameTeamPlayer = sameTeamPlayers({ Team: req.body.TeamName });
      new Promise((resolv, rejec) => {
        let allInTeam = sameTeamPlayers()
        player = req.body.Players
        req.body.Players.filter(a => {
          allInTeam.then(e => e.map(c => c.Player == a ? inDB.push(a) : ""))
            .then(_ => (player.length === inDB.length) ? resolv(player) : rejec([...inDB, ...player]))
        })
      }).then(_ => {
        // Checks atleast one player from same team
        new Promise((resolve, reject) => {
          if (isSameTeamPlayer.length != 0) {
            resolve(req.body.Players.map(async (e) => {
              await isSameTeamPlayer.then(a => a.map(async (a) => await a.Player == e ? resolve(teamPlayer = true) : reject()))
            }))
          } else {
            reject({ "code": 405, "description": "Atleast one player should be from same team" })
          }
        }).then(a => {
          //Checks Captain is in the list
          new Promise(async (resolv, rejec) => {
            let isCP = await sameTeamPlayers({ Player: req.body.Captain }), isCPS = false
            if (isCP.length != 0) {
              isCP.map(a => (a.Player == req.body.Captain && req.body.Players.filter(e => e == req.body.Captain ? isCPS = true : "")))
              if (isCPS) {
                resolv(req.body.Captain)
              } else {
                rejec({ "code": 405, "description": "seletcted Captain was not part of the list" })
              }
            } else {
              rejec({ "code": 405, "description": "seletcted Captain was not part of the list" })
            }
          }).then(async a => {

            // res.end(a)//Checks Vice-Captain is in the list
            new Promise(async (resolv, rejec) => {
              let isVCP = await sameTeamPlayers({ Player: req.body.viceCaptain }), isVSPs = false
              if (isVCP.length != 0) {
                isVCP.map(a => (a.Player == req.body.viceCaptain && req.body.Players.filter(e => e == req.body.viceCaptain ? isVSPs = true : "")))
                if (isVSPs) {
                  resolv(req.body.viceCaptain)
                } else {
                  rejec({ "code": 405, "description": "seletcted vice captain was not part of the list" })
                }
              } else {
                rejec({ "code": 405, "description": "seletcted vice captain was not part of the list" })
              }
            }).then(async a => {

              //Checks WicketKeeper is in the list
              new Promise(async (resolv, rejec) => {
                let isWKs = await sameTeamPlayers({ Role: "WICKETKEEPER" }), countList = 0;
                console.log(isWKs);
                // let set = new Set(isWKs); isWKs=[...set]
                if (isWKs.length != 0) {
                  //check WK in DB&list&MIN&MAX
                  isWKs.map(a => req.body.Players.filter(e => a.Player == e ? countList += 1 : countList))
                  if (countList > 0 && countList <= 8) {
                    console.log(countList);
                    resolv(countList)
                  } else {
                    rejec({ "code": 405, "description": "seletcted wicket keeper count was less or more 1 to 8" })
                  }
                  console.log(countList);
                } else {
                  rejec({ "code": 405, "description": "seletcted wicket keeper was not part of the list" })
                }
              }).then(async a => {
                //Checks BATTER is in the list
                new Promise(async (resolv, rejec) => {
                  let isWKs = await sameTeamPlayers({ Role: "BATTER" }), countList = 0
                  if (isWKs.length != 0) {
                    //check WK in DB&list&MIN&MAX
                    isWKs.map(a => req.body.Players.filter(e => a.Player == e ? countList += 1 : countList))
                    if (countList > 0 && countList <= 8) {
                      resolv(countList)
                    } else {
                      rejec({ "code": 405, "description": "seletcted BATTER count was less or more 1 to 8" })
                    }
                    console.log(countList);
                  } else {
                    rejec({ "code": 405, "description": "seletcted BATTER was not part of the list" })
                  }
                }).then(async a => {
                  //Checks ALL rounder is in the list
                  new Promise(async (resolv, rejec) => {
                    let isWKs = await sameTeamPlayers({ Role: "ALL-ROUNDER" }), countList = 0
                    if (isWKs.length != 0) {
                      //check WK in DB&list&MIN&MAX
                      isWKs.map(a => req.body.Players.filter(e => a.Player == e ? countList += 1 : countList))
                      if (countList > 0 && countList <= 8) {
                        resolv(countList)
                      } else {
                        rejec({ "code": 405, "description": "seletcted ALL-ROUNDER count was less or more 1 to 8" })
                      }
                      console.log(countList);
                    } else {
                      rejec({ "code": 405, "description": "seletcted ALL-ROUNDER was not part of the list" })
                    }
                  }).then(async a => {
                    //Checks BOWLER is in the list
                    new Promise(async (resolv, rejec) => {
                      let isWKs = await sameTeamPlayers({ Role: "BOWLER" }), countList = 0
                      if (isWKs.length != 0) {
                        //check WK in DB&list&MIN&MAX
                        isWKs.map(a => req.body.Players.filter(e => a.Player == e ? countList += 1 : countList))
                        if (countList > 0 && countList <= 8) {
                          (myTeam = req.body)

                          resolv(countList)
                        } else {
                          rejec({ "code": 405, "description": "seletcted BOWLER count was less or more 1 to 8" })
                        }
                        console.log(countList);
                      } else {
                        rejec({ "code": 405, "description": "seletcted BOWLER was not part of the list" })
                      }
                    }).then(async a => {
                      console.log(myTeam);
                      res.status(200).json({ "code": 200, "description": "Team Added", ...myTeam })
                    }, err => { res.status(405).json(err) }).catch(err => console.log(err))
                  }, err => res.status(405).json(err)).catch(e => console.log(err))
                  // res.end(a.toString())
                }, err => { res.status(405).json(err) }).catch(err => console.log(err))
                // res.end(a.toString())
              }, err => { res.status(405).json(err) }).catch(err => console.log(err))
              // res.end(a.toString())
            }, err => { res.status(405).json(err) }).catch(err => console.log(err))
            // res.end(a)
          }, err => { res.status(405).json(err) }).catch(err => console.log(err))

        }, err => { res.status(405).json(err) }).catch(err => console.log(err))
        // res.end('correct')
      }, e => res.status(405).json({ "code": 405, "description": "Players are out of list Please select correctly!" }))

    } else {
      res.json({ "code": 405, "description": "Players count should be 11" })
      return;
      // throw "Players count should be 11"
    }
  } catch (e) {
    console.log(e);
  }
})


// "/process-result"
app.get('/process-result', async (req, res) => {
  let playerScore = [], players = [], listOfPlayersinDB, resultPage = [], playerScoreList = {}, set, roles, promise
  promise = new Promise(async (resolve, reject)=>{
    resolve(myTeam)
  }).then(result=>{
    myTeam= result
  try {
    try { players = myTeam.Players; promise = [processResult({ batter: { "$in": players } }), sameTeamPlayers1()] }
    catch (err) { res.status(501).send({ "message":"Add your team first","description": "/add-team" }) }
    // promise = [await processResult(), sameTeamPlayers1()]
    Promise.all([...promise])
      .then((f) => {
        roles = f[1];
        let ofOne = f[0];
        let roleMethod = function (name, role) {
          return roles.filter(a => (a.Player == name && a.Role == role))
        }
        listOfPlayersinDB = f.flat(Infinity);
        if (listOfPlayersinDB.length != 0) {
          // listOfPlayersinDB.map(a => {
          //   players.push(a.batter),
          //     players.push(a.bowler),
          //     players.push(a["non-striker"]),
          //     players.push(a.fielders_involved)
          // })
          // set = new Set(players); players = [...set].filter(a => a != "NA");
          players.map((a, i) => {
            let teamName = (roles.map(p => { if (p.Player == a) return p.Team }));
            playerScoreList = {
              "id": i + 1,
              "Player": a,
              "score": 0,
              "points": 0,
              "boundary": 0,
              "six": 0,
              "run30": false,
              "half": false,
              "century": false,
              "dismissal": false,
              "isWicketDelivery": false,
              "captain": myTeam.Captain == a,
              "viceCaptain": myTeam.viceCaptain == a,
              "wicketCount": 0,
              "outBy": "NA",
              "kind": 'NA',
              "Team": teamName.filter(a => a != null)[0],
            }
            console.log(playerScoreList);
            // Batting Points
            listOfPlayersinDB.map(b => {
              if (a == b.batter) {
                if (b.batsman_run == 6) playerScoreList.points += 2, playerScoreList.six += 1;
                else if (b.batsman_run == 4) playerScoreList.points += 1, playerScoreList.boundary += 1;
                if (b.isWicketDelivery == 1) playerScoreList.isWicketDelivery = true;
                if (b.kind != 'NA') playerScoreList.kind = b.kind;
                playerScoreList.score += b.batsman_run;
                playerScoreList.points += b.batsman_run;
                if (b.fielders_involved == "NA") playerScoreList.outBy = b.bowler
                else if (b.fielders_involved != "NA") playerScoreList.outBy = b.fielders_involved
              }
              //Bowling Points caught and bowled, lbw, caught, bowled, Stumping
              if (a == b.bowler && b.isWicketDelivery == 1) {
                if (b.kind != "caught and bowled" && b.kind != "NA") playerScoreList.points += 25, playerScoreList.wicketCount += 1;
                else if (b.kind == "bowled" && b.kind == "lbw") playerScoreList.points += 8, playerScoreList.wicketCount += 1;
              }
              let over = b.overs
              if (a == b.bowler && ((b.ballnumber == 1 && b.overs == over && b.total_run == 0) && (b.ballnumber == 2 && b.overs == over && b.total_run == 0) && (b.ballnumber == 3 && b.overs == over && b.total_run == 0) && (b.ballnumber == 4 && b.overs == over && b.total_run == 0) && (b.ballnumber == 5 && b.overs == over && b.total_run == 0) && (b.ballnumber == 6 && b.overs == over && b.total_run == 0)) && b.innings == inning) {
                playerScoreList.points += 12
              }
              //Fielding Points
              if (a == b.fielders_involved && b.kind == "caught") playerScoreList.points += 8, playerScoreList.wicketCount += 1;
              if (a == b.fielders_involved && b.kind == "stumping") playerScoreList.points += 12, playerScoreList.wicketCount += 1;
              if (a == b.fielders_involved && b.kind == "caught and bowled") playerScoreList.points += 6, playerScoreList.wicketCount += 1;
            })
            playerScore.push(playerScoreList);
          })
          playerScore.map(e => {
            // Batting Points
            if (e.score >= 100) e.points += 16, e.century = true
            if (e.score >= 50) e.points += 8, e.half = true
            if (e.score >= 30) e.points += 4, e.run30 = true
            if (e.score == 0 && e.isWicketDelivery && roleMethod(e.Player, 'BOWLER')[0].Role == "BOWLER") e.points -= 2, e.dismissal = true
            //Bowling Points caught and bowled, lbw, caught, bowled, Stumping
            if (e.wicketCount >= 5) e.points += 16
            else if (e.wicketCount >= 4) e.points += 8
            else if (e.wicketCount >= 3) e.points += 4
            // Fielding Points
            if (e.wicketCount >= 3) e.points += 4
            //captain and vice captain points
            if(e.captain){
              e.points *= 2
            }else if(e.viceCaptain){
              e.points *= 1.5
            }
          })
          playerScore.map(a => {
            if (a.Player) {
              resultPage.push(a);
            }
          })
          res.json(resultPage)
        } else {
          res.status(500).send({ "description": "nothing" })
        }
      }, err => console.log(err)).catch(err => console.log(err))
  }
  catch (err) {
    console.log(err);
    //  res.status(500).send({ "description": "noth" }) 
    }
  })
})

app.get('/team-result', async (req, res) => {
  let result = await processResult(), battingTeamName = [], set, teamScore = [], scores = [], teams = [], promise, teamNames = [], teamPlayers = [], yourDream11TeamScored = 0, yourDream11TeamPoints = 0, team;
  promise = new Promise(async (resolve, reject) => {
    try {
      team = await axios.get('http://localhost:3000/process-result')
    } catch (err) {
      console.log(err, team);
      reject({ "message": "Add your team first" })
    }
    if (team == undefined) {
      // console.log(team);
      reject(team)
    } else (
      resolve(team.data)
    )
  }).then(
    processResultTeam => {
      // //gathering team names
      processResultTeam.map(a => teamNames.push(a.Team))
      set = new Set(teamNames); teamNames = [...set];
      battingTeamName = teamNames;
      //Calculating team scores
      battingTeamName.map(a => { let score = 0; result.map(b => (a == b.BattingTeam) ? score += b.total_run : ""); teamScore.push({ [a]: score }); })
      //sorting the scores in desc
      battingTeamName.map(a => { teamScore.map(b => { (b[a] != undefined) ? scores.push(b[a]) : ""; set = new Set(scores.sort((a, b) => b - a)); scores = [...set] }) })
      // create obj to send
      teamScore.map(b =>
        battingTeamName.filter(c =>
          (scores[0] == b[c]) ? teams.push(Object.assign({}, b, { 'match': 'won' }, {
            players: processResultTeam.filter(a => {
              if (a.Team == c) return a
            })
          })) : ""
        )
      )
      scores.map(async (a, ai) => {
        teamScore.map(b =>
          battingTeamName.filter(c =>
            (a == b[c] && ai != 0) ? teams.push(Object.assign({}, b, { 'match': 'lost' }, {
              players: processResultTeam.filter(a => {
                if (a.Team == c) return a
              })
            })) : ""
          )
        )
      })

      teams.map(a => {
        if (a.players.length != 0) {
          a.players.map(b => {
            yourDream11TeamPoints += b.points;
            yourDream11TeamScored += b.score;
          })
        }
      })
      res.json(Object.assign({ teams }, { "yourDream11TeamScored": yourDream11TeamScored, "yourDream11TeamPoints": yourDream11TeamPoints }))
    }, err => res.status(500).json({ "message": "/add-team first", team, err })
  )
});

app.get('/demo', async (req, res) => {
  res.send({ status: 1, message: "demo" });
});
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
run();