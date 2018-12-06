'use strict';

// TEST URLs
//  https://www.messenger.com/t/meguildtest
// https://www.messenger.com/t/meguildtest?ref=historians
// LAMBDA WEBHOOK: https://i8qwlzsqsc.execute-api.us-east-1.amazonaws.com/meBotAPIstage/MEBotInteraction
// EC2 WEBHOOK: https://www.mebotengine.ml:55555/webhook

// Constants

//environment vars for setting up bot connection to FB page and database
// let botConfig = require('./botConfig_uni');
let botConfig = require('./botConfig');
let config = new botConfig();
let envInfo = config.configInfo();

const express = require('express');
const request = require('superagent');
const request2 = require('request');
const fs = require('fs');
const bodyParser = require('body-parser');
const https = require('https');

let FBMessenger = require('fb-messenger');
let messenger = new FBMessenger(envInfo.pageAccessToken);

/*
  Almost all copy for the bot is pulled from here. Primary exception is for the any of the lines below that have dynamic content being pulled in.
*/
let botScriptData = require('./botScriptData');
let botScript = new botScriptData();
let phase1 = botScript.phase1Script();

let botScriptData2 = require('./botScriptData_int2');
let botScript2 = new botScriptData2();
let phase2 = botScript2.phase2Script();

let botScriptData3 = require('./botScriptData_int3');
let botScript3 = new botScriptData3();
let phase3 = botScript3.phase3Script();

let botScriptData4 = require('./botScriptData_int4');
let botScript4 = new botScriptData4();
let phase4 = botScript4.phase4Script();


// let imageLib = require('./imageHandler');
// let imgHandler = new imageLib();

/* DATABASE INIT */
let dbHandler = require('./dbHandler');
let db = new dbHandler();

let answerTally = {
  engineers: 0,
  historians: 0,
  navigators: 0,
  merchants: 0
};

var userID = null,
  currentPhase = phase1,
  user = {},
  btnFound = false,
  preQuizFlag = false,
  quizFlag = false,
  msgObj = null,
  hintTimer = null,
  yesResponses = ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿', 'sure', 'yea', 'yeah', 'why not', 'okay', 'okey doke', 'yes im doing good', 'yes definitely', 'yes i do', 'yes makes sense', 'yes i would', 'yes 100%', 'affirmative', 'fine', 'good', 'great', 'okay', 'ok', 'true', 'yea', 'yeah', 'all right', 'allright', 'alright', 'aye', 'beyond a doubt', 'certainly', 'definitely', 'exactly', 'good enough', 'gladly', 'granted', 'indubitably', 'just so', 'most assuredly', 'naturally', 'of course', 'positively', 'precisely', 'sure', 'sure thing', 'surely', 'understand', 'understood', 'undoubtedly', 'unquestionably', 'very well', 'willingly', 'without fail', 'yep', 'yes', 'i guess', 'i suppose', 'makes sense', 'cool', 'seems legit', 'meh', 'sweet', 'got it', 'i do', 'i can', 'i think so', 'y', 'i am', 'you bet', 'sounds fair', 'correct','Y','maybe', 'not sure', 'probably', 'possibly', 'i don’t know', 'i did', 'it is'],
  noResponses = ['👎', '👎🏻', '👎🏼', '👎🏽', '👎🏾', '👎🏿', 'nah', 'uh uh', 'dont think so', 'no this is the worst', 'no i want to stay', 'no i dont', 'no clue', 'no thanks', 'no', 'nope', 'nada', 'declined', 'not at all', 'negative', 'n','N', 'guess not'];

let setProfileInfo = (ID, obj) => {
  user[ID].userProfile = obj;
};
let getProfileInfo = (ID, key) => {
  return user[ID].userProfile[key];
};
let changeStatus = (ID, newStatus) => {
  let nxt = typeof newStatus !== 'undefined' ? newStatus : user[ID].currentPhase.paths[user[ID].status].nextStatus;

  user[ID].status = nxt;

  let obj = {
    status: user[ID].status
  };
  updateUserInfo(ID, obj, () => {
    botHandler(ID, {}, false);
  });

};
let internalInfo = (ID) => {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  dd = (dd < 10) ? '0' + dd : dd;
  mm = (mm < 10) ? '0' + mm : mm;
  today = mm + '/' + dd + '/' + yyyy;
  sendTextMessage(ID, 'Bot: Status' + today, () => {
    db.userFound(ID, {}, (results) => {
      sendTextMessage(ID, `database query: ${JSON.stringify(results)}`, () => {
        if (typeof user !== 'undefined') {
          sendTextMessage(ID, `USER OBJECT ${JSON.stringify(user)}`, () => {
            // user[ID].status = user[ID].currentStatus;
          });
        }
      });
    });
  });
};

let followupSessionTwo = (ID) => {

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  dd = (dd < 10) ? '0' + dd : dd;
  mm = (mm < 10) ? '0' + mm : mm;
  today = mm + '/' + dd + '/' + yyyy;
  sendTextMessage(ID, 'Bot: Status' + today, () => {
    db.userFound(ID, {}, (results) => {
      sendTextMessage(ID, `database query: ${JSON.stringify(results)}`, () => {
        if (typeof user !== 'undefined') {
          sendTextMessage(ID, `USER OBJECT ${JSON.stringify(user)}`, () => {
            // user[ID].status = user[ID].currentStatus;
          });
        }
      });
    });
  });
};


// --------------- Helpers -----------------------

/**
 * Main call to send a message to the user
 * @param  {} str Message being sent
 * @param  {} callback optional callback function
 */

let sendTextMessage = (ID, str, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;

  messenger.sendTextMessage(ID, str, function (err, body) {
    if (err) return console.error('error', err);
    if (callback !== null) {
      callback();
    }
  });

};
/**
 * Send typing dots status to user
 * @param  {} duration How long to show typing dots
 * @param  {} callback optional callback function
 */
let showTyping = (ID, duration, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  messenger.sendAction(ID, 'typing_on');
  setTimeout(() => {
    messenger.sendAction(ID, 'typing_off');
    callback();
  }, duration);
};
/**
 * Mark user's message as seen
 * @param  {} duration delay before sending callback after marking seen
 * @param  {} callback optional callback function
 */
let showSeen = (ID, duration, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  messenger.sendAction(ID, 'mark_seen');
  setTimeout(() => {
    callback();
  }, duration);
};

/**
 * Send user an image
 * @param  {} img absolute URL  to image
 * @param  {} callback optional callback function
 */
let sendImage = (ID, img, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  messenger.sendImageMessage(ID, img, function (err, evt) {
    if (err) return console.log(err);
    callback();
  });
};

/**
 * Send user an image
 * @param  {} img absolute URL  to image
 * @param  {} callback optional callback function
 */
let sendSavedImage = (ID, img, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  var messageData = {
    'attachment': {
      'type': 'image',
      'payload': {
        'attachment_id': img
      }
    }
  };

  messenger.sendMessage(ID, messageData, function (err, evt) {
    if (err) return console.log(err);
    try {
      callback();
    } catch (e) {
      console.log(e);
      /* */
    }
  });
};

/**
 * Send user an image
 * @param  {} img absolute URL  to image
 * @param  {} callback optional callback function
 */
let sendSavedVideo = (ID, vid, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  var messageData = {
    'attachment': {
      'type': 'video',
      'payload': {
        'attachment_id': vid
      }
    }
  };

  messenger.sendMessage(ID, messageData, function (err, evt) {
    if (err) return console.log(err);
    try {
      callback();
    } catch (e) {
      console.log(e);
      /* */
    }
  });
};

/**
 * Send user an image
 * @param  {} img absolute URL  to image
 * @param  {} callback optional callback function
 */
let sendVideo = (ID, vid, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  var messageData = {
    'attachment': {
      'type': 'video',
      'payload': {
        'url': vid
      }
    }
  };

  messenger.sendMessage(ID, messageData, function (err, evt) {
    if (err) return console.log(err);
    try {
      callback();
    } catch (e) {
      console.log(e);
      /* */
    }
  });
};
/**
 * Send user a message with buttons as response options
 * @param  {} str String of message/question sent to user
 * @param  {} btnOptions Structure below. title = label, payload = returned value from user response
  [
    { title: 'YES', payload: 'videoIntro'},
    { title: 'NO', payload: 'surveyStart'}
  ]
 * @param  {} callback optional callback function
 */
let sendButtonMessage = (ID, str, btnOptions, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  var btnArray = [];
  for (var i = 0; i < btnOptions.length; i++) {
    btnArray.push({
      content_type: 'text',
      title: btnOptions[i].title,
      payload: btnOptions[i].payload
    });
  }
  messenger.sendQuickRepliesMessage(ID, str, btnArray, function (err, evt) {
    if (err) return console.log(err);
    try {
      callback();
    } catch (e) {
      /* */
    }
  });
};
/**
 * Default message sent if reponse isn't matched
 * 
 */
let rejectStatus = '';
let rejectCount = 1;
let sendRejectionMessage = (ID, YesNoCheck) => {
  YesNoCheck = typeof YesNoCheck !== 'undefined' ? YesNoCheck : false;
  let selected = '';
  let responses = [
    'I’d wager 5 Quirkes if you rephrase that, I can better understand you.',
    'I hear you. But, I’m not certain what you mean. Yes or no?',
    'I’m afraid we’ll never fully understand this Ancient technology. Maybe try retyping your response as yes or no?',
    'This Ancient Tech can be so problematic. Please try again.',
    'Hmm. Maybe typing “yes” or “no” can help this ancient tech to function properly.',
    'The Guild of Engineers are still figuring out this Ancient Tech. Maybe answering “yes” or “no” will work better.'
  ];
  let yesnoResponses = [
    'I hear you. But, I’m not certain what you mean. Yes or no?',
    'Hmm. Maybe typing “yes” or “no” can help this ancient tech to function properly.',
    'I’m afraid we’ll never fully understand this Ancient technology.\nMaybe try retyping your response as yes or no?'
  ];
  if (user[ID].attempts < 1) {
    selected = responses[Math.floor(Math.random() * responses.length)];
    sendTextMessage(ID, selected);
    user[ID].attempts += 1;
  } else if (user[ID].attempts == 1) {

    selected = (YesNoCheck) ? yesnoResponses[Math.floor(Math.random() * yesnoResponses.length)] : responses[Math.floor(Math.random() * responses.length)];
    sendTextMessage(ID, selected);
    user[ID].attempts += 1;
  } else {
    sendTextMessage(ID, 'I thought you’d be more helpful than that.\nMaybe we can try again another time.\nGood bye.');
    user[ID].status = 'endInteraction1';
  }
};
let resetAttempts = (ID) => {
  user[ID].attempts = 0;
};

let showEmojiResponse = (ID) => {
  showTyping(ID, 2200, function () {
    sendTextMessage(ID, 'Seems this old tech cannot decipher icons of emotion.', () => {
      showTyping(ID, 1000, function () {
        sendTextMessage(ID, 'Let’s try a simple yes or no.');
      });
    });
  });

};

// --------------- Methods -----------------------

/**
 * call triggered from Get Started button
 */
let initUser = (ID) => {
  user[ID] = {};
  user[ID].ID = ID;
  user[ID].first_name = 'Citizen';
  user[ID].attempts = 0;
  user[ID].guild = '';
  user[ID].preQuizFlag = true;
  user[ID].quizFlag = false;

};

// TEST USER IDs
/* Shun Live 2093294007382064 */
/* Shun Dev 1673627912714016 */
/* Andy 1587801794657635 */
/* Project C Dev 1731193596992122 */
/* Project C Live 883665018424119 */
/* Dino 1768664439867579 */
/* Morgan 1584507178328118 */ 
/* Matthew 1685460031507283 */
/* Leigh 1760166547372521 */

let adminUsers = [
  2093294007382064,
  1673627912714016,
  1587801794657635,
  1731193596992122,
  883665018424119,
  1768664439867579,
  1584507178328118,
  1685460031507283,
  1760166547372521
]
let inTestGroup = (ID) => {
  let compID = parseInt(ID);
  return adminUsers.indexOf(compID) > -1;
  ;
}

// The lambdaHandler function has a check for specific test users that can run the commands in this function
let adminCommandsCheck = (userID,userResponse) => {
  let followupInt = null;
  let followupTestID = 1673627912714016;

  switch (userResponse) {
    
    //USED TO RUN A FOLLOW UP MESSAGE TEST TO SPECIFIC USERS
    case 'followupimagetestdino':
    followupTestID = 1768664439867579;
    case 'followupimagetestmatthew':
    followupTestID = 1685460031507283;
    case 'followupimagetest':
    db.sendQuery(userID, "SELECT * FROM guildmembers WHERE fbid = "+followupTestID, (res) => {
      console.log('followupImageTest',followupTestID);
      sendImage(followupTestID, 'https://s3.amazonaws.com/mortalengines/Test_gif.gif', () => {
        sendTextMessage(followupTestID, `Greetings ${res.name}, this is follow up message. The Wingkong is Exchange is ready to dominate.`,()=>{
          sendTextMessage(userID, `Hello, a message was sent to ${followupTestID}`);

        });
      }); 
    });
      return;
      break;

    case 'testfollowupphase2':
      db.sendQuery(userID, "SELECT * FROM guildmembers WHERE can_send_plus_one = 1", (res) => {
        let canFollowUp = res.filter(dbuser => ((dbuser.fbid == 1760166547372521) ||(dbuser.fbid == 1673627912714016)));
        // let canFollowUp = res.filter(dbuser => ((dbuser.fbid == 1685460031507283) ||(dbuser.fbid == 1768664439867579) || (dbuser.fbid == 1673627912714016)));
        console.log('canFollowUp',canFollowUp);
        followupInt = setInterval(() => {
          if (canFollowUp.length > 0) {
            let fUpUser = canFollowUp.pop();
            let obj = {
              can_send_plus_one: 0,
              phase: 2,
              status: 'i1_scene1_followup'
            };
            updateUserInfo(fUpUser.fbid, obj, () => {
              sendTextMessage(fUpUser.fbid, `Hello, ${fUpUser.name}. Your time on London has been productive. I’ve spoken to my supervisor Dr. Pomeroy about getting you an apprenticeship in the Guild of Historians. Isn’t that exciting?`, () => {
                console.log('user sent message:', fUpUser);
                // botHandler(fUpUser.fbid, {}, false);
              });

            });

          } else {
            console.log('users follow up complete');
            clearInterval(followupInt);
          }
        }, 10000);
        // sendTextMessage(userID, `DB ENTRIES ${JSON.stringify(canFollowUp)}`);
      });
      return;
      break;

      // USE THIS COMMAND TO SEND THE FOLLOW UP MESSAGE FOR SECOND INTERACTION. WILL QUERY THE DATABASE, RUN THROUGH ELIGIBLE ACCOUNTS AND SEND FOLLOW UP MESSAGES AT AN INTERVAL OF ONE PER MINUTE. NOTE SENT TO LOG FILE WHEN UPDATES ARE DONE
    case 'followupphase2':
      db.sendQuery(userID, "SELECT * FROM guildmembers WHERE can_send_plus_one = 1", (res) => {
        let canFollowUp = res.filter(dbuser => dbuser.phase == 1);
        followupInt = setInterval(() => {
          if (canFollowUp.length > 0) {
            let fUpUser = canFollowUp.pop();
            let obj = {
              can_send_plus_one: 0,
              phase: 2,
              status: 'i1_scene1_followup'
            };
            updateUserInfo(fUpUser.fbid, obj, () => {
              sendSavedImage(fUpUser.fbid, phase2.paths.i1_scene1_followup.imageattached, () => {
                /* */
                console.log('user sent message:', fUpUser);
              });
            });

          } else {
            console.log('users follow up complete');
            clearInterval(followupInt);
          }
        }, 60000);
      });
      return;
      break;

    case 'followupphase3':
      db.sendQuery(userID, "SELECT * FROM guildmembers WHERE can_send_plus_one = 1", (res) => {
        let canFollowUp = res.filter(dbuser => dbuser.phase == 3);
        followupInt = setInterval(() => {
          if (canFollowUp.length > 0) {
            let fUpUser = canFollowUp.pop();
            let obj = {
              can_send_plus_one: 0,
              phase: 3,
              status: 'i3_scene1_followup'
            };
            updateUserInfo(fUpUser.fbid, obj, () => {
              sendSavedImage(fUpUser.fbid, phase3.paths.i3_scene1_followup.imageattached, () => {
                /* */
                console.log('user sent message:', fUpUser);
              });
            });

          } else {
            console.log('users follow up complete');
            clearInterval(followupInt);
          }
        }, 60000);
      });
      return;
      break;

      case 'usercheck1':
      var cutoff = new Date(2018,11,4);
      db.sendQuery(userID, "SELECT * FROM guildmembers WHERE can_send_plus_one = 1", (res) => {
        let canFollowUp = res.filter(dbuser => dbuser.phase == 3);
        let dateFollowUp = canFollowUp.filter(phaseuser => ((new Date(phaseuser.last_active_time)) < cutoff));
        sendTextMessage(userID, `follow up count: ${dateFollowUp.length}`,()=>{
          if (dateFollowUp.length > 0) {
            dateFollowUp.forEach((val)=>{
              console.log('user:', val);
            });
          }
        });

        });
      return;
      break;

    case 'showdbcount':
      db.sendQuery(userID, "SELECT * FROM guildmembers WHERE phase = 3", (res) => {
        let moveCanFollowUp = res.filter(dbuser => dbuser.phase == 1);
        sendTextMessage(userID, `DB ENTRIES ${JSON.stringify(res.length)}`);
        console.log('users available');
        console.log(res);
      });
      return;
      break;

    case 'showdbcount2':
      db.sendQuery(userID, "SELECT * FROM guildmembers WHERE phase = 4", (res) => {
        let moveCanFollowUp = res.filter(dbuser => dbuser.phase == 1);
        sendTextMessage(userID, `DB ENTRIES ${JSON.stringify(res.length)}`);
        console.log('users available');
        console.log(res);
      });
      return;
      break;

    case 'numuserentries':
      db.sendQuery(userID, "SELECT * FROM guildmembers", (res) => {
        sendTextMessage(userID, `# DB ENTRIES: ${res.length}`);
      });
      return;
      break;
    case 'myuserinfo':
      internalInfo(userID);
      return;
      break;
    case 'startint2':
      changeStatus(userID, 'i1_scene1');
      return;
      break;
    case 'badgemaker':
      getBadge(userID);
      return;
      break;
    case 'reset':
      initUser(userID);
      startSession(userID);
      return;
      break;
  }

}


let getBadge = (ID, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;

  let uname = user[ID].userProfile.first_name + ' ' + (user[ID].userProfile.last_name).charAt(0) + '.';
  // let imgurl = 'https://graph.facebook.com/' + ID + '/picture?type=large&access_token=' + envInfo.pageAccessToken;
  let imgurl = 'https://graph.facebook.com/' + ID + '/picture?width=623&height=583&access_token=' + envInfo.pageAccessToken;

  let data = {};
  data.name = uname;
  data.job = user[ID].guild || 'historians';
  data.img = imgurl;


  let cmURL = 'https://www.mortalengines.com/badgemaker/index.php';
  // let cmURL = 'http://universal.projectc.net/badgemaker/index.php';
  let body = JSON.stringify(data);
  request2.post(
    cmURL, {
      form: {
        body
      }
    },
    function (error, response, body) {
      if (!error) {

        console.log(`body: ${body}`);
        console.log(`response: ${response}`);
        console.log(response);
        let rtnData = JSON.parse(body);
        console.log('image returned', rtnData.image);

        showTyping(ID, 4000, function () {
          sendImage(ID, rtnData.image, () => {
            updateUserInfo(ID, {
              badgeid: rtnData.badgeid
            }, () => {
              if (callback !== null) {
                callback();
              }
            });
          });
        });

      } else {
        console.log('error', error);
        if (callback !== null) {
          callback();
        }
      }
    }
  );
};
let getUserInfo = (ID, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;

  let url = `https://graph.facebook.com/${ID}?fields=first_name,last_name,profile_pic&access_token=${envInfo.pageAccessToken}`;
  request.get(url)
    .end((err, res) => {
      let userinfo = {
        first_name: 'Citizen'
      };
      if (err) {
        if (callback !== null) {
          callback(userinfo);
        }
        return console.log(err);
      }
      userinfo = JSON.parse(res.text);
      if (callback !== null) {
        callback(userinfo);
      }

    });

}
let startSession = (ID) => {
  // console.log('startSession',ID);

  getUserInfo(ID, (resp) => {
    let userinfo = resp;
    setProfileInfo(ID, userinfo);
    user[ID].status = 'i1_scene1';
    user[ID].currentPhase = phase2;
    var data = {
      ID: ID,
      first_name: userinfo['first_name'],
      status: user[ID].status
    };
    db.addUser(ID, data, () => {
      botHandler(ID, userinfo, false);
    });
  });
};

let firstEntity = (entities, name) => {
  return entities && entities[name] && entities[name][0];
};

let updateUserInfo = (fbID, data, callback) => {
  callback = typeof callback !== 'undefined' ? callback : null;
  data.last_active_time = db.formatTimestamp();

  // TABLE VALUES
  // fbid
  // name
  // guild
  // phase
  // status
  // badgeid
  // can_send_plus_one
  // last_active_time

  // console.log('updateUserInfo');
  // console.log(data);

  db.updateDBInfo(fbID, data, callback);
};
/**
 * Checks message for a yes or no response
 * @param  {} msgObj Message object sent back from Messenger
 */
let simpleYesNo = msgObj => {
  var testText = msgObj.message.text
    .toLowerCase()
    .replace(',', '')
    .replace('’', '');
  var hasYes = testText.includes('yes') || yesResponses.indexOf(testText) > -1 || ((typeof msgObj.message.sticker_id !== 'undefined') && (msgObj.message.sticker_id == 369239263222822));
  var hasNo = testText.includes('no') || noResponses.indexOf(testText) > -1;
  var mood = firstEntity(msgObj.message.nlp.entities, 'sentiment');
  var nlpPos = mood && mood.confidence > 0.5 && (mood.value == 'positive');
  var nlpNeg = mood && mood.confidence > 0.5 && mood.value == 'negative';
  var response = (hasYes && !hasNo) ? 'yes' : (hasNo && !hasYes) ? 'no' : 'unknown';

  return response;
};

let expectedResponse = (userResponse, optionArray) => {
  return optionArray.indexOf(userResponse.toLowerCase()) > -1;
};

let pluralize = (char) => {
  return (char[char.length - 1] == 's') ? char : char + 's';
}
/**
 * Set of checks we can do to gauge tone of user response. Will expand if needed.
 * @param  {} entities
 * @param  {} mood
 */
let checkMood = (entities, mood) => {
  /* RETURNS TONE OF USER RESPONSE */
  if (entities == {})
    return {
      result: null,
      found: false
    };

  var output = {
      result: null,
      found: true,
      verbal: ''
    },
    tmood;

  switch (mood) {
    case 'greeting':
      tmood = firstEntity(entities, mood);
      output.result = tmood && tmood.confidence > 0.5;
      output.verbal = output.result ? 'hello' : '';
      break;

    case 'isNeutral':
      tmood = firstEntity(entities, 'sentiment');
      output.result = tmood && tmood.confidence > 0.6 && tmood.value == 'neutral';
      break;

    case 'isHostile':
      tmood = firstEntity(entities, 'sentiment');
      output.result = tmood && tmood.confidence > 0.7 && tmood.value == 'negative';
      break;

    default:
      /* */
      break;
  }
  return output;
};

let updateQuizTally = (response) => {
  // answerTally[response] += 1;
  if (response.indexOf(',') > -1) {
    response.split(',').forEach(function (v, i) {
      answerTally[v] += 1;
    });
  } else {
    answerTally[response] += 1;
  }
}

/**
 * Primary handler for bot interaction
 * @param  {} data the message object that is returned from Facebook 
 * @param  {} answerPending flag used to determine whether the handler should be expecting the answer to a question.
 */
let botHandler = (ID, data, answerPending) => {
  data = typeof data !== 'undefined' ? data : {};
  ID = typeof ID !== 'undefined' ? ID : userID;
  answerPending = typeof answerPending !== 'undefined' ? answerPending : false;
  let dbData = {};
  let callback = null;

  if ((typeof user[ID] == 'undefined') || (user[ID] == {})) {
    // if (!('status' in user[ID])) {
    console.log('no status found');
    initUser(ID);
    db.userFound(ID, {}, (results) => {
      user[ID].status = results.status;
      botHandler(ID, data, answerPending);
    });
    return;

  }
  switch (user[ID].status) {

    case 'i1_scene1':
      if (!answerPending) {
        // showTyping(ID, 3500, function () {
          sendSavedImage(ID, phase2.paths[user[ID].status].imageattached, () => {
            /* */
          });
        // });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase2.paths[user[ID].status].yes :  phase2.paths[user[ID].status].no;
          showTyping(ID, 5000, function () {
            sendTextMessage(ID, resp, () => {
              // user[ID].status = phase2.paths[user[ID].status].quizStatus;
              // user[ID].quizFlag = true;
              // botHandler(ID, {}, false);
              setTimeout(()=>{
                changeStatus(ID);
              },5000)
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

    case 'i1_scene1_followup':
      if (!answerPending) {
        // showTyping(ID, 3500, function () {
          sendSavedImage(ID, phase2.paths[user[ID].status].image, () => {
            /* */
          });
        // });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase2.paths[user[ID].status].yes :  phase2.paths[user[ID].status].no;
          showTyping(ID, 5000, function () {
            sendTextMessage(ID, resp, () => {
              // user[ID].status = phase2.paths[user[ID].status].quizStatus;
              // user[ID].quizFlag = true;
              // botHandler(ID, {}, false);
              setTimeout(()=>{
                changeStatus(ID);
              },5000)
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

    case 'i1_scene2':
      if (!answerPending) {
        showTyping(ID, 3000, function () {
          sendTextMessage(ID, phase2.paths[user[ID].status].intro, () => {
            // showTyping(ID, 4000, function () {
              // sendTextMessage(ID, phase2.paths[user[ID].status].intro2, () => {
                /* */
              // });
            // });
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase2.paths[user[ID].status].yes :  phase2.paths[user[ID].status].no;
          showTyping(ID, 5000, function () {
            sendTextMessage(ID, resp, () => {
                changeStatus(ID);
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

    case 'i1_scene3':
      if (!answerPending) {
        showTyping(ID, 1500, function () {
          sendTextMessage(ID, phase2.paths[user[ID].status].intro.replace('(Username)', user[ID].userProfile.first_name), () => {
            // showTyping(ID, 4000, function () {
            //   sendTextMessage(ID, phase2.paths[user[ID].status].intro2, () => {
            //     /* */
            //   });
            // });
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase2.paths[user[ID].status].yes :  phase2.paths[user[ID].status].no;
          showTyping(ID, 4000, function () {
            sendTextMessage(ID, resp, () => {
              // user[ID].status = phase2.paths[user[ID].status].quizStatus;
              // user[ID].quizFlag = true;
              // botHandler(ID, {}, false);
              // setTimeout(()=>{
                changeStatus(ID);
              // },5000)
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

    case 'i1_scene4':
      if (!answerPending) {
        showTyping(ID, 4500, function () {
          sendTextMessage(ID, phase2.paths[user[ID].status].intro, () => {
            // showTyping(ID, 4000, function () {
            //   sendTextMessage(ID, phase2.paths[user[ID].status].intro2, () => {
            //     /* */
            //   });
            // });
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          
          var resp = (simpleYesNo(data) == 'yes') ? phase2.paths[user[ID].status].yes :  phase2.paths[user[ID].status].no;
          var resp2 = (simpleYesNo(data) == 'yes') ? phase2.paths[user[ID].status].yes2 :  phase2.paths[user[ID].status].no2;
          showTyping(ID, 5000, function () {
            sendTextMessage(ID, resp, () => {
              showTyping(ID, 250, function () {
                // sendImage(ID, phase2.paths[user[ID].status].image, () => {
                  sendSavedVideo(ID, phase2.paths[user[ID].status].video, () => {
                  showTyping(ID, 5000, function () {
                    sendTextMessage(ID, resp2, () => {
                      changeStatus(ID);
                    });      
                  });
                });
              });
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;


    case 'endNotHelpful':
      showTyping(ID, 3800, function () {
        sendTextMessage(ID, phase2.paths[user[ID].status].response, () => {
          sendTextMessage(ID, phase2.paths[user[ID].status].response2);
        });
      });
      if (answerPending) {
        user[ID].status = user[ID].returnstatus;
        botHandler(ID, {}, false);

      }
      break;

    case 'end':
      if (answerPending) {
        user[ID].status = 'i1_scene1';
        botHandler(ID, {}, false);
      }
      break;

      case 'endInteraction1nonLinear':
      dbData.can_send_plus_one = 1;

      break;

      case 'i3_scene1':
      dbData.can_send_plus_one = 0;
      if (!answerPending) {
        showTyping(ID, 1500, function () {
          sendSavedImage(ID, phase3.paths[user[ID].status].imageattached, () => {
            /* */
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          changeStatus(ID);
          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

      case 'i3_scene1_followup':
      dbData.can_send_plus_one = 0;
      if (!answerPending) {
        // showTyping(ID, 3500, function () {
          sendSavedImage(ID, phase3.paths[user[ID].status].imageattached, () => {
            /* */
          });
        // });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {

          changeStatus(ID);
          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;


      case 'i3_scene2':
      case 'i3_scene3':
      case 'i3_scene4':
      if (!answerPending) {
        showTyping(ID, 1500, function () {
          var resp = (phase3.paths[user[ID].status].intro.indexOf('(Username)') > -1) ? phase3.paths[user[ID].status].intro.replace('(Username)', user[ID].userProfile.first_name) : phase3.paths[user[ID].status].intro;
          sendTextMessage(ID, resp, () => {
            /* */
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase3.paths[user[ID].status].yes :  phase3.paths[user[ID].status].no;
          showTyping(ID, 4000, function () {
            sendTextMessage(ID, resp, () => {
                changeStatus(ID);
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

      case 'i3_scene5':
      if (!answerPending) {
        showTyping(ID, 600, function () {
          sendSavedImage(ID, phase3.paths[user[ID].status].imageattached, () => {
            showTyping(ID, 4000, function () {
              sendTextMessage(ID, phase3.paths[user[ID].status].intro, () => {
                showTyping(ID, 4000, function () {
                  sendTextMessage(ID, phase3.paths[user[ID].status].intro2, () => {
                    // changeStatus(ID);
                  });
                });
              });
            });
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase3.paths[user[ID].status].yes :  phase3.paths[user[ID].status].no;
          showTyping(ID, 4000, function () {
            sendTextMessage(ID, resp, () => {
                changeStatus(ID);
            });
          });
          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

      case 'i3_scene6':
        showTyping(ID, 600, function () {
          sendTextMessage(ID, phase3.paths[user[ID].status].intro, () => {
            changeStatus(ID);
          });
        });
      break;



      case 'i4_scene1':
      case 'i4_scene1_followup':
      dbData.can_send_plus_one = 0;
      if (!answerPending) {
        showTyping(ID, 1500, function () {
          var resp = (phase4.paths[user[ID].status].intro.indexOf('(Username)') > -1) ? phase4.paths[user[ID].status].intro.replace('(Username)', user[ID].userProfile.first_name) : phase4.paths[user[ID].status].intro;
          sendTextMessage(ID, resp, () => {
            /* */
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase4.paths[user[ID].status].yes :  phase4.paths[user[ID].status].no;
          showTyping(ID, 4000, function () {
            sendTextMessage(ID, resp, () => {
                changeStatus(ID);
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

      case 'i4_scene2':
      if (!answerPending) {
        showTyping(ID, 1000, function () {
          var resp = (phase4.paths[user[ID].status].intro.indexOf('(Username)') > -1) ? phase4.paths[user[ID].status].intro.replace('(Username)', user[ID].userProfile.first_name) : phase4.paths[user[ID].status].intro;
          sendTextMessage(ID, resp, () => {
            /* */
          });
        });
      } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase4.paths[user[ID].status].yes :  phase4.paths[user[ID].status].no;
          showTyping(ID, 4000, function () {
            sendTextMessage(ID, resp.replace('(Username)', user[ID].userProfile.first_name), () => {
              getBadge(ID,()=>{
                changeStatus(ID);
              });
            });
          });

          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;


      case 'i4_scene3':
      if (!answerPending) {
            showTyping(ID, 3000, function () {
              sendTextMessage(ID, phase4.paths[user[ID].status].intro, () => {
                showTyping(ID, 4000, function () {
                  sendTextMessage(ID, phase4.paths[user[ID].status].intro2, () => {
                    // changeStatus(ID);
                  });
                });
              });
            });

          } else {
        if ((simpleYesNo(data) == 'yes') || (simpleYesNo(data) == 'no')) {
          var resp = (simpleYesNo(data) == 'yes') ? phase4.paths[user[ID].status].yes :  phase4.paths[user[ID].status].no;
          var resp2 = (simpleYesNo(data) == 'yes') ? phase4.paths[user[ID].status].yes2 :  phase4.paths[user[ID].status].no2;
          showTyping(ID, 1500, function () {
            sendTextMessage(ID, resp, () => {
              showTyping(ID, 2500, function () {
                sendTextMessage(ID, resp2, () => {
                    changeStatus(ID);
                });
              });
            });
          });
          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

      case 'i4_scene4':
        showTyping(ID, 3000, function () {
          sendTextMessage(ID, phase4.paths[user[ID].status].intro.replace('(Username)', user[ID].userProfile.first_name), () => {
            showTyping(ID, 1500, function () {
              sendTextMessage(ID, phase4.paths[user[ID].status].intro2, () => {
                changeStatus(ID);
              });
            });
          });
        });
      break;


      case 'endInteraction1':
      if (!answerPending) {
        dbData.can_send_plus_one = 1;
        dbData.phase = 3;
  
        // ENABLE FOR LINEAR
        setTimeout(() => {
          user[ID].status = 'i3_scene1';
          user[ID].currentPhase = phase3;
          botHandler(ID, {}, false);
        }, 45*1000);
        // }, 3*60*60*1000);
      }
      break;


    case 'endInteraction2':
    if (!answerPending) {
      dbData.can_send_plus_one = 1;
      dbData.phase = 4;

      // ENABLE FOR LINEAR
      setTimeout(() => {
        user[ID].status = 'i4_scene1';
        user[ID].currentPhase = phase4;
        botHandler(ID, {}, false);
      }, 45*1000);
      // }, 3*60*60*1000);
    }
    break;

    case 'endInteraction3':
    dbData.can_send_plus_one = 1;
    dbData.phase = 5;

    break;

    case 'NoResponse':
      /* */
      break;

      /********************************************** */

    case 'status':
      /* */
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      dd = (dd < 10) ? '0' + dd : dd;
      mm = (mm < 10) ? '0' + mm : mm;
      today = mm + '/' + dd + '/' + yyyy;
      sendTextMessage(ID, 'Bot: Status' + today, () => {
        sendTextMessage(ID, `${JSON.stringify(user[ID])}`, () => {
          user[ID].status = user[ID].currentStatus;
        });
      });
      // callback = db.endSession();
      break;


    default:
      /* */
      break;
  }
  dbData.status = user[ID].status;
  updateUserInfo(ID, dbData, callback);
};


// --------------- Main handler -----------------------

/**
 * Handles data returned from Messenger API
 * @param  {} event
 * @param  {} callback
 */

let lambdaHandler = (event, callback) => {
  var data = event.body;
  // console.log(`lambdaHandler data ${JSON.stringify(data)}`);

  if (data.object === 'page') {
    data.entry.forEach(function (entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;
      entry.messaging.forEach(function (msg) {

        //Sets userID for session
        userID = userID == null || msg.sender.id ? msg.sender.id : userID;
        userID = parseInt(userID);
        // CHECK FOR POSTBACK
        if (msg.postback) {
          /* CHECK FOR GET STARTED BUTTON CLICK */
          if (msg.postback.payload == 'GET_STARTED_PAYLOAD') {
            user[userID] = {};
            user[userID].ID = userID;
            user[userID].attempts = 0;
            user[userID].guild = msg.postback.referral !== undefined ? msg.postback.referral.ref : '???';
            user[userID].preQuizFlag = (user[userID].guild == '???');
            user[userID].quizFlag = false;

            db.userFound(userID, {}, () => {
              startSession(userID);
            });
            // startSession(userID);
            return;
          }
          // console.log(`msg.postback ${JSON.stringify(msg.postback)}`);
          /* POSTBACK RESPONSE */
        } else if (typeof msg.message !== 'undefined' && typeof msg.message.quick_reply !== 'undefined') {
          /* QUICK REPLY (BUTTON) RESPONSE */
          msgObj = msg;
          btnFound = true;
          botHandler(userID, msg, true);

        } else if (typeof msg.message !== 'undefined' && !msg.message.is_echo) {

          /* MESSAGE HAS A EMOJI OR STICKER */
          if (typeof msg.message.sticker_id !== 'undefined') {

            if ((msg.message.sticker_id == 369239263222822) && (typeof user[userID] == 'undefined')) {
              initUser(userID);
              db.userFound(userID, {}, () => {
                startSession(userID);
              });

              // } else if(msg.message.sticker_id == 369239263222822) {
              //   msg.message.text = 'yes';
              //   botHandler(userID, msg, true);
            } else {
              showEmojiResponse(userID);

            }
            return;
          }
          /* MESSAGE RESPONSE FROM USER */
          // let answerPresent = expectedResponse(
          //   msg.message.text.toLowerCase(),
          //   ['👍🏿', 'hello', 'hi', 'get started', 'greetings', 'hello?', 'start', 'anyone there?', '?']
          // );
          // if (answerPresent && (typeof user[userID] == 'undefined')) {
          //   // if ((typeof user[userID] == 'undefined')) {
          //   initUser(userID);
          //   db.userFound(userID, {}, () => {
          //     startSession(userID);
          //   });
          //   return;
          // }
          // console.log('user',userID);
          if ((typeof user[userID] == 'undefined')) {
            getUserInfo(userID, (resp) => {
              initUser(userID);
              let userinfo = resp;
              setProfileInfo(userID, userinfo);
              user[userID].status = 'i1_scene1';
              user[userID].currentPhase = phase1;
              var data = {
                ID: userID,
                first_name: userinfo['first_name'],
                status: 'i1_scene1'
              };

              db.userFound(userID, {}, (userCheck) => {
                if (typeof userCheck == 'not found') {
                  db.addUser(userID, data, (resp) => {
                    console.log('user added to db getting second interaction');
                    console.log(resp);
                    user[userID].status = 'i1_scene1';
                    user[userID].currentPhase = phase2;  
                    botHandler(userID, msg, true);
                  });
                } else {

                  user[userID].status = ((typeof userCheck.status !== 'undefined') && userCheck.status !== 'endInteraction1') ? userCheck.status : 'i3_scene1_followup';
                  user[userID].currentPhase = (parseInt(userCheck.phase) == 3) ? phase3 : phase2;
                  console.log('user session lost',user[userID].status);

                  // user[userID].status = userCheck.status;
                  // user[userID].currentPhase = (parseInt(userCheck.phase) == 1) ? phase1 : (parseInt(userCheck.phase) == 2) ? phase2 : phase3;
                  // sendTextMessage(userID, `I apologize for the unpredictability of this old tech. Maybe some day our Guild of Engineers will master it. But, not today.`,()=>{
                    botHandler(userID, msg, true);
                  // });
                }
              });
            });
            return;
          }

          /* ADMIN COMMANDS */
          if (inTestGroup(userID)) {
            adminCommandsCheck(userID,msg.message.text.toLowerCase());
          }
          /* *************** */

          if (msg.message.sticker_id == 'status') {
            user[userID].currentStatus = user[userID].status;
            user[userID].status = 'status';
          }
          msgObj = msg;
          botHandler(userID, msg, true);
          // console.log('current Status: ' + user[userID].status);
        } else {
          // console.log("DATA RECEIVED: ", event);
        }
      });
    });
  }
  callback.sendStatus(200);

  // }
};


// ROUTING
config.initServer(lambdaHandler);

// let server  = require('http').createServer(app);
// server.listen(55555, () => {
//   console.log('App is ready on port 55555');
// });

// https.createServer({
//   key: fs.readFileSync(envInfo.privkey),
//   cert: fs.readFileSync(envInfo.cert),
//   ca: fs.readFileSync(envInfo.chain)
// }, app).listen(55555, function () {
//   console.log('App is ready on port 55555');
// });