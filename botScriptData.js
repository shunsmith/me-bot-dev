'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  Almost all copy for the bot is pulled from here. Primary exception is for the any of the lines below that have dynamic content being pulled in. Vars were being returned as undefined, so these lines of text are applied directly in botHandler()
*/
// --------------- Script Data -----------------------
let media = {
    thaddeus: 'https://s3.amazonaws.com/mortalengines/valentine-fpo.jpg',
    london: 'https://s3.amazonaws.com/mortalengines/blueprint7.jpg',
    fpo2: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00003R.jpg',
    anna: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00133R.jpg',
    cd: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00126R.jpg',
    fpo5: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00153R.jpg',
    fpo6: 'https://s3.amazonaws.com/mortalengines/2488_TP2_00155R.jpg',
    citycenter: 'https://s3.amazonaws.com/mortalengines/citycenter2.jpg',
    thegut: 'https://s3.amazonaws.com/mortalengines/thegut3.jpg',
    cathedral:'https://s3.amazonaws.com/mortalengines/stpaulscathedral2.jpg'
  };
  
let phase1 = {
    paths: {
      disclaimer: {
        intro: '*Warning!*\nYou’re attempting to access RESTRICTED 21st century technology.',
        question: 'Are you sure you want to proceed?',
        negative: 'Goodbye.',
        nextStatus: 'scene1'
      },
      scene1: {
        intro: 'Hello. I’m Antonia Critt, a Historian at the London Museum.',
        guildFound: 'I see you are a new citizen, designated to the…',
        question: 'I see you are a new citizen, have you been assigned a Guild yet?',
        negative: 'No problem. I can give you a quick placement test now.',
        quizStatus: 'question1',
        nextStatus: 'quizComplete',
        guildStatus: 'guildCheck'
      },
      question1: {
        question: 'YOU FIND A STRANGE 21ST CENTURY ARTIFACT. WHAT DO YOU DO?',
        btnOptions: [{
            title: 'SELL IT',
            payload: 'merchants'
          },
          {
            title: 'DONATE IT',
            payload: 'navigators'
          },
          {
            title: 'DESTROY IT',
            payload: 'engineers'
          },
          {
            title: 'STUDY IT',
            payload: 'historians'
          }
        ],
        nextStatus: 'question2'
      },
      question2: {
        question: 'THE “STRONGEST” SHOULD ALWAYS…',
        btnOptions: [{
            title: 'CONSUME THE WEAK',
            payload: 'engineers'
          },
          {
            title: 'SUPPORT THE WEAK',
            payload: 'historians'
          },
          {
            title: 'LEAD THE WEAK',
            payload: 'navigators'
          },
          {
            title: 'PROFIT OFF THE WEAK',
            payload: 'merchants'
          }
        ],
        nextStatus: 'question3'
      },
      question3: {
        question: 'SELECT ONE OF THESE PIECES OF ANCIENT TECH.',
        btnOptions: [{
            title: 'COMPACT DISC',
            payload: 'historians'
          },
          {
            title: 'TOASTER',
            payload: 'navigators'
          },
          {
            title: 'VIDEO GAME',
            payload: 'engineers'
          },
          {
            title: 'CELLULAR PHONE',
            payload: 'merchants'
          }
        ],
        nextStatus: 'question4'
      },
      question4: {
        question: 'THE “PAST” IS BEST DESCRIBED AS…',
        btnOptions: [{
            title: 'A TREASURE',
            payload: 'merchants'
          },
          {
            title: 'A GHOST',
            payload: 'engineers'
          },
          {
            title: 'A LESSON',
            payload: 'historians'
          },
          {
            title: 'A MAP',
            payload: 'navigators'
          }
        ],
        nextStatus: 'question5'
      },
      question5: {
        question: 'WHICH DO YOU PREFER?',
        btnOptions: [{
            title: 'THE MARKET',
            payload: 'merchants'
          },
          {
            title: 'THE PUB',
            payload: 'engineers'
          },
          {
            title: 'THE MUSEUM',
            payload: 'historians'
          },
          {
            title: 'THE OBSERVATORY',
            payload: 'navigators'
          }
        ],
        nextStatus: 'quizComplete'
      },
      guildCheck: {
        question: 'To which Guild were you assigned?',
        expectedResponses: [
          'engineers',
          'historians',
          'merchants',
          'navigators',
          'engineer',
          'historian',
          'merchant',
          'navigator'
        ],
        btnOptions: [
          {
            title: 'Historians',
            payload: 'historians'
          },
          {
            title: 'Merchants',
            payload: 'merchants'
          },
          {
            title: 'Engineers',
            payload: 'engineers'
          },
          {
            title: 'Navigators',
            payload: 'navigators'
          }
        ],
        nextStatus: 'scene2'
      },
      quizPrevTaken: {
        question: 'Is that correct?',
        negative: 'No? Sorry. This technology of the Ancients can be most difficult.',
        negativeStatus: 'question1',
        nextStatus: 'scene2'
      },
      quizComplete: {
        intro: 'Okay, that completes the test. According to the results you have been designated the...',
        engineers: 'Engineers pride themselves on keeping our city moving forward, but London would be nowhere without we Historians.',
        navigators: 'Navigators pride themselves on steering our city’s path to success, but London would be nowhere without we Historians.',
        merchants: 'Merchants pride themselves on fueling London’s economy, but London would be nowhere without we Historians.',
        followup:'No matter. All appears in order. Welcome to London!',
        historians: 'Welcome to London!',
        nextStatus: 'scene2',
        guildStatus: 'guildCheck'
      },
      scene2: {
        question: 'Are you ready for a brief orientation of the city?',
        nextStatus: 'scene3',
        exitStatus: 'endNotHelpful'
      },
      scene3: {
        intro: 'It took just 60 minutes for the Ancients to bring humanity to the brink of extinction.',
        intro2: 'Few survived the dark centuries which followed. These were years plagued by volcanic upheaval, violent winds and acid rains. But eventually, civilisation returned to the Earth.',
        intro3: 'The survivors mobilised their settlements and the Traction Era began.\nPowered by mighty engines, London arose from the ashes to become the fiercest Predator City on earth.',
        question: 'Do you see a schematic of the great city of London?',
        positive: 'Your survival on London depends on your ability to integrate into our society. London is structured into 7 tiers according to social status.',
        negative: 'We’ll never fully understand this ancient tech. Let me try again.',
        image: media.london,
        nextStatus: 'scene4'
      },
      scene4: {
        response: 'St. Paul’s Cathedral sits atop Guildhall, from where our elite govern.',
        response2: 'Below that, in the city’s center, you find shops and middle class housing.',
        response3: 'Finally, the lower tiers. And The Gut, where you are now. That is where all new citizens begin their time on London.',
        response4: 'New citizens find it difficult to untether themselves from the Gut. Often sentenced to a life of hard labour for London’s prosperity.',
        question: 'Do you see St. Paul’s Cathedral at the very top?',
        intro: 'It’s near Guildhall, from where the elite of us govern.',
        intro2: 'Below that, in the city’s center, you can find shops and middle class housing.',
        image: media.cathedral,
        image2: media.citycenter,
        image3: media.thegut,        
        nextStatus: 'scene6'
      },
      // scene5: {
      //   question: 'Then, lower still is the Gut, where you are now. Can you see it?',
      //   negative: 'Look near bottom of the city, above the wheels.',
      //   response: 'It’s mainly slums, digestion yards, and motors.',
      //   response2: 'All new citizens begin their time on London here.',
      //   response3: 'And, can find it difficult to ever untether themselves from it.\nA life of hard labour for others’ prosperity.',
      //   nextStatus: 'scene6'
      // },
      scene6: {
        question: `Does that sound fair?`,
        negative: 'I might be able to improve your situation.',
        negative2: 'I think you might better serve London by working alongside me in the Historians Guild at the Museum.',
        negativeHistorian: 'Based on your orientation results, I think you may better serve London working as an apprentice here in the museum.',
        positive: `Fair or not, I think I can improve your situation.`,
        positive2: `based on your orientation results, I think you may better serve London working as an apprentice here in the museum.`,
        nextStatus: 'scene7',
        reject: 'rejectMessage'
      },
      scene7: {
        question: 'Would that be more suited to your liking?',
        image: media.london,
        negative: 'Understood. As you’ll be spending most of your time in the stinking sprawl of The Gut, I don’t anticipate our paths to cross again.',
        negative2: 'Best of luck. Antonia.',
        positive: 'You’ve made the right choice. I’ll discuss your situation with our director, Dr. Pomeroy, and get back to you.',
        positive2: 'Until then, enjoy all London has to offer.',
        nextStatus: 'endInteractive1',
        reject: 'rejectMessage'
      },
      endInteractive1: {
        nextStatus: 'interactionOneInterim'
      },
      interactionOneInterim: {
        positive: 'I’m glad to hear that.',
        negative: 'I’m sorry to hear that.',
        response: 'I spoke to Director Pomeroy about your situation. As soon as he makes a decision, I’ll contact you.',
        response2: 'For now, I must sign off.  But, please take care of yourself.',
        response3: 'Goodbye, Antonia.',
        nextStatus: 'endInteractive1'
      },
      endNotHelpful: {
        response: 'I thought you’d be more adventurous than that.\nMaybe we can try again another time?',
        response2: 'I’ll be ready when you are. Goodbye for now.'
      },
      rejectMessage: {
        useButton: `I'm afraid I don't understand.`,
      },
      buttonReceivedTextResponse:'Please use one of the buttons above to answer.'
    }
  };
  
  var botScriptData = function(){

    function botScriptData() {
      _classCallCheck(this, botScriptData);
    }
    _createClass(botScriptData, [
       {
        key: 'phase1Script',
        value: function phase1Script() {
          return phase1;
        }
      },
  ]);
  
    return botScriptData;
  
  }();
  
  exports.default = botScriptData;
  module.exports = exports['default'];