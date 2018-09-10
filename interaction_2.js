'use strict';
// Handler for Second Interaction


// TEST URLs
//  https://www.messenger.com/t/meguildtest
// https://www.messenger.com/t/meguildtest?ref=historian
// LAMBDA WEBHOOK: https://i8qwlzsqsc.execute-api.us-east-1.amazonaws.com/meBotAPIstage/MEBotInteraction
// EC2 WEBHOOK: https://www.mebotengine.ml:55555/webhook

// Constants
// const pageAccessToken = "EAADtGHOeGq4BAJZBzn3rVBuN8tM3sObfJS7faYLwlerjcAhxTqBUyiioQY5nEXSPAe7hOdZAFzama5o3ZCCLZC9pcNpkTmBFkwGYTnYKRFyg5eaMlPsItYreW374BUBnHsgZBWW9H9xcnFxAGQt6vIYzqHVbtzLTXvGXHZCx7StwZDZD";
// const appID = '260689274739374';
// const appSecret = '6971c4298d26c93cefb6139eb733ae61';

let pageAccessToken =
  'EAAIxbPex8eIBAO7YWSp6FeDSbLetlhacmZAUKrDRZBkNOQ8FZB4DXtl3IADZAuD37ZAwF8fg0T20S8oAD1pCr0nUDsp6vMvZBVXZBAJFByF8Nds1FtIueTZBZBKXWFV02vW6E50GZB5r0p4u2H3Amx08KC2fPNa4qZAZC7TNI98DZBwm7gwZDZD';
let appID = '617294035284450';
let appSecret = 'a0a2bd892c79ec2943ca61cc1bbc9410';
const verifyToken = "meBotMe";
const privkey = "/etc/letsencrypt/archive/www.mebotengine.ml/privkey1.pem";
const cert = "/etc/letsencrypt/archive/www.mebotengine.ml/cert1.pem";
const chain = "/etc/letsencrypt/archive/www.mebotengine.ml/chain1.pem";
const pageID = '1913415872266963';

const express = require('express');
const request = require('superagent');
const bodyParser = require('body-parser');
const https = require('https');

// let MessengerPlatform = require('facebook-bot-messenger');
let FBMessenger = require('fb-messenger');
let messenger = new FBMessenger(pageAccessToken);
let pageToken = "";

/*
  Almost all copy for the bot is pulled from here. Primary exception is for the any of the lines below that have dynamic content being pulled in.
*/
let botScriptData = require('./botScriptData');
let botScript = new botScriptData();
let phase1 = botScript.phase1Script();

const app = express().use(bodyParser.json());
const fs = require('fs');
let dbHandler = require('./dbHandler');
let db = new dbHandler();

let answerTally = {
  engineers: 0,
  historians: 0,
  navigators: 0,
  merchants: 0
};

var userID = null,
  user = {},
  // guild = '',
  btnFound = false,
  // userProfile = {},
  // status = '',
  // guildNotFound = false,
  preQuizFlag = false,
  quizFlag = false,
  msgObj = null,
  yesResponses = ['sure', 'yea', 'yeah', 'why not', 'okay', 'okey doke', 'yes im doing good', 'yes definitely', 'yes i do', 'yes makes sense', 'yes i would', 'yes 100%', 'affirmative', 'fine', 'good', 'great', 'okay', 'ok', 'true', 'yea', 'yeah', 'all right', 'allright', 'alright', 'aye', 'beyond a doubt', 'certainly', 'definitely', 'exactly', 'good enough', 'gladly', 'granted', 'indubitably', 'just so', 'most assuredly', 'naturally', 'of course', 'positively', 'precisely', 'sure', 'sure thing', 'surely', 'understand', 'understood', 'undoubtedly', 'unquestionably', 'very well', 'willingly', 'without fail', 'yep', 'yes', 'i guess', 'i suppose', 'makes sense', 'cool', 'seems legit', 'meh', 'sweet', 'got it', 'i do','i can', 'i think so'],
  noResponses = ['nah', 'uh uh', 'dont think so', 'no this is the worst', 'no i want to stay ', 'no i dont', 'no clue', 'no thanks', 'no', 'nope', 'nada', 'declined', 'not at all', 'negative', 'nah son'];

let setProfileInfo = (ID, obj) => {
  user[ID].userProfile = obj;
};
let getProfileInfo = (ID, key) => {
  return user[ID].userProfile[key];
};
let changeStatus = (ID) => {
  user[ID].status = phase1.paths[user[ID].status].nextStatus;

  let obj = {
    status: user[ID].status
  };
  updateUserInfo(ID, obj, () => {
    botHandler(ID, {}, false);
  });

};



// --------------- Helpers -----------------------

/**
 * Main call to send a message to the user
 * @param  {} str Message being sent
 * @param  {} callback optional callback function
 */

let sendTextMessage = (ID, str, callback) => {
  // console.log('userID',userID);
  callback = typeof callback !== 'undefined' ? callback : null;
  // messenger.sendTextMessage(ID, `${ID} ${str}`, function (err, body) {
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
 * TODO: Expand for more options
 */
let rejectStatus = '';
let rejectCount = 1;
let sendRejectionMessage = (ID, YesNoCheck) => {
  YesNoCheck = typeof YesNoCheck !== 'undefined' ? YesNoCheck : false;
  let selected = '';
  let responses = [
    'I’d wager 5 Quirkes that you could rephrase that for me to better understand.',
    'This Ancient Tech can be so problematic. Please try again.',
    'Not sure what you’re saying?',
    'I don’t understand. Can you rephrase?',
    'I’m afraid I don’t understand.'
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
    user[ID].status = 'endInteractive1';
  }
};
let resetAttempts = (ID) => {
  user[ID].attempts = 0;
};

// --------------- Methods -----------------------

/**
 * call triggered from Get Started button
 */
let startSession = (ID) => {
  messenger.getProfile(ID, function (e, b) {
    if (e) return console.error('error', e);
    setProfileInfo(ID, b);
    user[ID].status = 'disclaimer';

    var data = {
      ID: ID,
      first_name: b['first_name'],
      status: user[ID].status
    };

    db.addUser(ID, data, () => {
      botHandler(ID, b, false);
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
  console.log('updateUserInfo');
  console.log(data);
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
  var hasYes = testText.includes('yes') || yesResponses.indexOf(testText) > -1;
  var hasNo = testText.includes('no') || noResponses.indexOf(testText) > -1;
  var mood = firstEntity(msgObj.message.nlp.entities, 'sentiment');
  var nlpPos = mood && mood.confidence > 0.5 && (mood.value == 'positive');
  var nlpNeg = mood && mood.confidence > 0.5 && mood.value == 'negative';
  var response = (hasYes && !hasNo) || nlpPos ? 'yes' : (hasNo && !hasYes) || nlpNeg ? 'no' : 'unknown';
  // console.log(`simple yes no: hasYes:${hasYes} hasNo:${hasNo} mood${mood} nlpPos${nlpPos} nlpNeg${nlpNeg} `)

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
  /*
    OTHER ENTITIES: thanks,bye,datetime,amount_of_money,email,distance,quantity,temperature,location,duration 
  */

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

  if(!('status' in user[ID])) {
    console.log('no status found');
    
    db.userFound(ID,{},(results)=>{
      user[ID].status = results.status;
      botHandler(ID, data, answerPending);
    });
    return;
    
  }
  switch (user[ID].status) {
    case 'disclaimer':
      if (!answerPending) {
        showTyping(ID, 4000, function () {
          sendTextMessage(ID, phase1.paths[user[ID].status].intro, () => {
            showTyping(ID, 2500, function () {
              sendTextMessage(ID, phase1.paths[user[ID].status].question);
            });
          });
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          showTyping(ID, 1500, function () {
            changeStatus(ID);
          });
          resetAttempts(ID);
        } else if (simpleYesNo(data) == 'no') {
          showTyping(ID, 3000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative, () => {
          showTyping(ID, 2000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative2, () => {
              user[ID].status = 'end';
              botHandler(ID, {}, false);
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

    case 'scene1':
      if (!answerPending) {
        showTyping(ID, 3500, function () {
          sendTextMessage(ID, phase1.paths[user[ID].status].intro, () => {
            showTyping(ID, 4000, function () {
              if (!user[ID].preQuizFlag) {
                sendTextMessage(ID, phase1.paths[user[ID].status].guildFound, () => {
                  changeStatus(ID);
                });
              } else {
                sendTextMessage(ID, phase1.paths[user[ID].status].question);
              }
            });
          });
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          phase1.paths[user[ID].status].nextStatus = phase1.paths[user[ID].status].guildStatus;
          resetAttempts(ID);
          changeStatus(ID);
        } else if (simpleYesNo(data) == 'no') {
          showTyping(ID, 5000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative, () => {
              user[ID].status = phase1.paths[user[ID].status].quizStatus;
              user[ID].quizFlag = true;
              botHandler(ID, {}, false);
              // changeStatus();
            });
          });
          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

    case 'question1':
    case 'question2':
    case 'question3':
    case 'question4':
    case 'question5':
      if (!answerPending) {
        showTyping(ID, 4000, function () {
          sendButtonMessage(ID, phase1.paths[user[ID].status].question, phase1.paths[user[ID].status].btnOptions, () => {
            answerPending = true;
          });
        });
      } else {
        if (typeof data.message.quick_reply !== 'undefined') {
          answerTally[data.message.quick_reply.payload] += 1;
          showTyping(ID, 1200, function () {
            changeStatus(ID);
          });

        } else {
          showTyping(ID, 2500, function () {
            sendTextMessage(ID, phase1.paths.buttonReceivedTextResponse, () => {
              botHandler(ID, {}, false);
            });
          });
        }
      }
      break;

    case 'guildCheck':
      if (!answerPending) {

        showTyping(ID, 2500, function () {
          sendButtonMessage(ID, phase1.paths[user[ID].status].question, phase1.paths[user[ID].status].btnOptions, () => {
            user[ID].status = 'guildCheck';
            answerPending = true;
          });
        });
        // showTyping(ID, 2500, function () {
        //   user[ID].status = 'guildCheck';
        //   sendTextMessage(ID, phase1.paths[user[ID].status].question);
        // });
      } else {

        if (typeof data.message.quick_reply !== 'undefined') {
          answerTally[data.message.quick_reply.payload] += 1;
          user[ID].guild = data.message.quick_reply.payload;
          // console.log('guild', user[ID].guild);
          showTyping(ID, 5500, function () {
            sendTextMessage(ID, phase1.paths.quizComplete[user[ID].guild], () => {
              changeStatus(ID);
            });
          });
        } else {
          let answerPresent = expectedResponse(
            data.message.text.toLowerCase(),
            phase1.paths[user[ID].status].expectedResponses
          );
          if (answerPresent) {
            user[ID].guild = pluralize(data.message.text.toLowerCase());
            // console.log('guild', user[ID].guild);
            showTyping(ID, 5500, function () {
              sendTextMessage(ID, phase1.paths.quizComplete[user[ID].guild], () => {
                changeStatus(ID);
              });
            });
          } else {
            showTyping(ID, 2500, function () {
              sendTextMessage(ID, phase1.paths.buttonReceivedTextResponse, () => {
                botHandler(ID, {}, false);
              });
            });
          }
        }
      }
      break;

    case 'quizComplete':
      if (user[ID].quizFlag) {
        user[ID].guild = Object.keys(answerTally).reduce((a, b) => (answerTally[a] > answerTally[b] ? a : b));

        showTyping(ID, 2500, function () {
          sendTextMessage(ID, phase1.paths[user[ID].status].intro, () => {
            user[ID].quizFlag = false;
            botHandler(ID, {}, false);
          });
        });
      } else if (!answerPending) {
        showTyping(ID, 3000, function () {
          sendTextMessage(ID, `Guild of ${user[ID].guild.charAt(0).toUpperCase() + user[ID].guild.slice(1)}.`, () => {
            showTyping(ID, 2500, function () {
              sendTextMessage(ID, phase1.paths[user[ID].status][user[ID].guild], () => {
                changeStatus(ID);
              });
            });
          });
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          showTyping(ID, 5500, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status][user[ID].guild], () => {
              changeStatus(ID);
            });
          });
          resetAttempts(ID);

        } else if (simpleYesNo(data) == 'no') {
          showTyping(ID, 4500, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative, () => {
              user[ID].status = phase1.paths[user[ID].status].guildStatus;
              botHandler(ID, data, false);
            });
          });
          resetAttempts(ID);

        } else {
          user[ID].status = phase1.paths[user[ID].status].guildStatus;
          botHandler(ID, data, true);
        }
      }
      break;

    case 'scene2':
      if (!answerPending) {
        showTyping(ID, 2200, () => {
          sendTextMessage(ID, `Now I’ll walk you through our orientation process. Alright, ${user[ID].userProfile.first_name}?`);
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          changeStatus(ID);
          resetAttempts(ID);

        } else if (simpleYesNo(data) == 'no') {
          user[ID].status = phase1.paths[user[ID].status].exitStatus;
          botHandler(ID, {}, false);
          resetAttempts(ID);
        } else {
          sendRejectionMessage(ID);
        }
      }
      break;

    case 'scene3':
      if (!answerPending) {
        //'It took just 60 minutes...'
        showTyping(ID, 3000, function () {
          sendTextMessage(ID, phase1.paths[user[ID].status].intro, () => {
            showTyping(ID, 4000, function () {
              sendTextMessage(ID, phase1.paths[user[ID].status].intro2, () => {
                showTyping(ID, 500, function () {
                  sendImage(ID, phase1.paths[user[ID].status].image, () => {
                    showTyping(ID, 3000, function () {
                      sendTextMessage(ID, phase1.paths[user[ID].status].question);
                    });
                  });
                });
              });
            });
          });
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          showTyping(ID, 2000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].positive, () => {
              changeStatus(ID);
            });
          });
          resetAttempts(ID);

        } else if (simpleYesNo(data) == 'no') {
          showTyping(ID, 2000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative, () => {
              showTyping(ID, 3500, function () {
                sendTextMessage(ID, phase1.paths[user[ID].status].negative2, () => {
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

    case 'scene4':
      if (!answerPending) {
        showTyping(ID, 4000, function () {
          sendTextMessage(ID, phase1.paths[user[ID].status].question, () => {
            /**/
          });
        });
      } else {
        if (simpleYesNo(data) == 'yes' || simpleYesNo(data) == 'no') {
          showTyping(ID, 4000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].intro, () => {
              showTyping(ID, 6500, function () {
                sendTextMessage(ID, phase1.paths[user[ID].status].intro2, () => {
                  showTyping(ID, 3500, function () {
                    sendTextMessage(ID, phase1.paths[user[ID].status].intro3, () => {
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

    case 'scene5':
      if (!answerPending) {
        showTyping(ID, 3000, function () {
          sendTextMessage(ID, phase1.paths[user[ID].status].question);
        });
      } else {
        if (simpleYesNo(data) == 'yes' || simpleYesNo(data) == 'no') {
          showTyping(ID, 5000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].response, () => {
              showTyping(ID, 5000, function () {
                sendTextMessage(ID, phase1.paths[user[ID].status].response2, () => {
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

    case 'scene6':
      if (!answerPending) {

        showTyping(ID, 2200, function () {
          sendTextMessage(ID, phase1.paths[user[ID].status].question);
        });
      } else {

        let uName = getProfileInfo(ID, 'first_name');
        if (simpleYesNo(data) == 'yes') {
          let response =
            user[ID].guild === 'historians' ?
            phase1.paths[user[ID].status].positiveHistorian :
            phase1.paths[user[ID].status].positiveDefault+uName+'.';

          showTyping(ID, 2200, function () {
            sendTextMessage(ID, response, () => {
              changeStatus(ID);
            });
          });
          resetAttempts(ID);
        } else if (simpleYesNo(data) == 'no') {
          showTyping(ID, 5200, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative+uName+'.', () => {
              showTyping(ID, 2200, function () {
                sendTextMessage(ID, phase1.paths[user[ID].status].negative2, () => {
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

    case 'scene7':
      if (!answerPending) {
        showTyping(ID, 2200, function () {
          // 'Would that be better suited'
          sendTextMessage(ID, phase1.paths[user[ID].status].question);
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          showTyping(ID, 2000, function () {
            sendTextMessage(
              ID, `You’ve made the right choice, ${getProfileInfo(ID,
                'first_name'
              )}. I’ll discuss your situation with my supervisor, Dr. Pomeroy.`,
              () => {
                // showTyping(ID, 6000, function () {
                  // sendTextMessage(ID, phase1.paths[user[ID].status].positive2, () => {
                    changeStatus(ID);
                  // });
                // });
              }
            );
          });
          resetAttempts(ID);
        } else if (simpleYesNo(data) == 'no') {
          showTyping(ID, 2000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative, () => {
              showTyping(ID, 6000, function () {
                sendTextMessage(ID, phase1.paths[user[ID].status].negative2, () => {
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

    case 'scene8':
      if (!answerPending) {
        showTyping(ID, 500, function () {
          sendImage(ID, phase1.paths[user[ID].status].image, () => {
            showTyping(ID, 3000, function () {
              sendTextMessage(ID, phase1.paths[user[ID].status].question);
            });
          });
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          showTyping(ID, 5500, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].positive, () => {
              showTyping(ID, 4500, function () {
                sendTextMessage(ID, phase1.paths[user[ID].status].positive2, () => {
                  showTyping(ID, 5500, function () {
                    sendTextMessage(ID, phase1.paths[user[ID].status].positive3, () => {
                      showTyping(ID, 4500, function () {
                        sendTextMessage(ID, phase1.paths[user[ID].status].positive4, () => {
                          changeStatus(ID);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          resetAttempts(ID);
        } else if (simpleYesNo(data) == 'no') {
          showTyping(ID, 4000, function () {
            sendTextMessage(ID, phase1.paths[user[ID].status].negative, () => {
              showTyping(ID, 3500, function () {
                sendTextMessage(ID, phase1.paths[user[ID].status].negative2, () => {
                  showTyping(ID, 2500, function () {
                    sendTextMessage(ID, phase1.paths[user[ID].status].negative3, () => {
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
        sendTextMessage(ID, phase1.paths[user[ID].status].response, () => {
          sendTextMessage(ID, phase1.paths[user[ID].status].response2);
        });
      });
      if (answerPending) {
            // user[ID].status = 'reengage';
            // botHandler(ID, {}, false);
            user[ID].status = 'end';
            botHandler(ID, {}, false);

      }
      break;

    case 'end':
      if (answerPending) {
        user[ID].status = 'scene1';
        botHandler(ID, {}, false);
      }
      break;

    case 'reengage':
      if (!answerPending) {
        showTyping(ID, 2400, function () {
          sendTextMessage(ID, 'Welcome back, care to start the process?');
        });
      } else {
        if (simpleYesNo(data) == 'yes') {
          showTyping(ID, 2400, function () {
            sendTextMessage(ID, 'Excellent let\'s begin', () => {
              user[ID].status = 'scene1';
              botHandler(ID, {}, false);
            });
          });
        } else if (simpleYesNo(data) == 'no') {
          user[ID].status = 'endNotHelpful';
          botHandler(ID, {}, false);
        } else {
          sendRejectionMessage(ID, true);
        }
      }
      break;

    case 'endInteractive1':
      /* */
      dbData.can_send_plus_one = 1;
      if(parseInt(ID) == 1673627912714016) {
        setTimeout(()=>{
          sendTextMessage(ID, 'This follow up message was initiated days ago');
        },(2*60*60*1000));
      }
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
  // if (event.query !== {}) {
  //   var queryParams = event.query;
  //   var rVerifyToken = queryParams['hub.verify_token'];
  //   if (rVerifyToken === verifyToken) {
  //     var challenge = queryParams['hub.challenge'];
  //     var response = {
  //       body: parseInt(challenge),
  //       statusCode: 200
  //     };
  //     callback(null, response);
  //   } else {
  //     var response = {
  //       body: 'Error, wrong validation token',
  //       statusCode: 422
  //     };
  //     callback(null, response);
  //   }
  // } else {
  // var data = JSON.parse(event.body);
  var data = event.body;
  console.log(`lambdaHandler data ${JSON.stringify(data)}`);

  if (data.object === 'page') {
    data.entry.forEach(function (entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;
      entry.messaging.forEach(function (msg) {
        // console.log(msg);
        //Sets userID for session
        userID = userID == null || msg.sender.id ? msg.sender.id : userID;
        userID = parseInt(userID);
        // CHECK FOR POSTBACK
        if (msg.postback) {
          /* CHECK FOR GET STARTED BUTTON CLICK */
          if (msg.postback.payload == 'GET_STARTED_PAYLOAD') {
            user
            user[userID] = {};
            user[userID].ID = userID;
            user[userID].attempts = 0;
            user[userID].guild = msg.postback.referral !== undefined ? msg.postback.referral.ref : '???';
            user[userID].preQuizFlag = (user[userID].guild == '???');
            user[userID].quizFlag = false;
            db.userFound(userID,{},()=>{startSession(userID);});
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
          // console.log('quick reply received: ' + JSON.stringify(msg));
        } else if (typeof msg.message !== 'undefined' && !msg.message.is_echo) {
          /* MESSAGE RESPONSE FROM USER */
          if (msg.message.text.toLowerCase() == 'reset') {
            user[userID] = {};
            user[userID].ID = userID;
            user[userID].guild = 'historians';
            user[userID].attempts = 0;
            startSession(userID);
            return;
          }
          msgObj = msg;
          botHandler(userID, msg, true);
          console.log('current Status: ' + user[userID].status);
          // console.log('message received: ' + JSON.stringify(msg));
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

let webhookHandler = (req, res) => {
  lambdaHandler(req, res);
}

app.route('/webhook')
  .get((req, res) => {
    if (req.query['hub.verify_token'] === verifyToken) {
      return res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
  })
  .post((req, res) => {
    lambdaHandler(req, res);
  });

app.post('/token', (req, res) => {
  // console.log('token post', req.body);
  if (req.body.verifyToken === verifyToken) {
    pageToken = req.body.token;
    return res.sendStatus(200);
  }
  res.sendStatus(403);
});
app.get('/token', (req, res) => {
  // console.log('token get', req.body);
  if (req.body.verifyToken === verifyToken) {
    return res.send({
      token: pageToken
    });
  }
  res.sendStatus(403);
});

https.createServer({
  key: fs.readFileSync(privkey),
  cert: fs.readFileSync(cert),
  ca: fs.readFileSync(chain)
}, app).listen(55555, function () {
  console.log('App is ready on port 55555');
});