$(document).ready(function () {

    // Initial Experiment Parameters
    // -------------------------------------------------------------------------------------------------- //
    var expName = 'Positivity';
    //var language = "en"; // only en is available at the moment
    var compLink = 1;
    var nSessions = 3;
    var questionnaire = 1;

    // Main Exp
    var nCond = 9;
    nCond--; //because of range function
    var nCondPerSession = 3;
    var nTrialsPerCondition = 1;
    var nTrialsPerSession = nTrialsPerCondition * ((nCond + 1) / nSessions);

    var feedbackDuration = 2000;
    var sumReward = 0;
    //var totalReward = 0;

    // Training
    var nCondTraining = 3;
    var nTrialTrainingPerCond = 1;
    var nTrainingTrials = nTrialTrainingPerCond * nCondTraining;//1;
    var maxTrainingSessions = 2;
    var nTrainingImg = nCondTraining * 2;
    nCondTraining--; // because of range function

    // Lotteries
    var nTrialsPerConditionLot = 1;
    var nTrialsLotteries = (nCond + 1) * nTrialsPerConditionLot;

    var initTime = (new Date()).getTime();

    var expID = createCode();

    var clickDisabled = false;
    var trainSess = -1;
    var maxDBCalls = 1;
    var browsInfo = getOS() + ' - ' + getBrowser();

    var subID = expID;

    var link = 'https://app.prolific.ac/submissions/complete?cc=W72FT5TV';

    // Manage compensations
    // -------------------------------------------------------------------------------------------------- //
    // one point equals 7.5 pence
    var conversionRate = 7.5;
    var pointsToPence = points => points * conversionRate;
    var penceToPounds = pence => pence / 100;
    var pointsToPounds = points => penceToPounds(pointsToPence(points));

    // if offline is 1 do not call database
    var offline = 0;

    // Define conditions
    // -------------------------------------------------------------------------------------------------- //
    var probs = [];
    var rewards = [];

    rewards['neutral'] = [
        // opt 1  // opt2
        [[0, 0], [-1, 1]], //cond1
        [[0, 0], [-1, 1]], // cond2
        [[0, 0], [-1, 1]], //cond3
    ];

    probs['neutral'] = [
        // opt 1  // opt2
        [[1, 1], [.25, .75]], //cond1
        [[1, 1], [.5, .5]],   // cond2
        [[1, 1], [.75, .25]], //cond3
    ];

    rewards['punishment'] = [
        // opt 1  // opt2
        [[-1, -1], [-2, 0]], //cond 4
        [[-1, -1], [-2, 0]], // cond 5
        [[-1, -1], [-2, 0]], //cond 6
    ];

    probs['punishment'] = [
        // opt 1  // opt2
        [[1, 1], [.25, .75]], //cond4
        [[1, 1], [.5, .5]],  //cond5
        [[1, 1], [.75, .25]], //cond6
    ];

    rewards['reward'] = [
        // opt 1  // opt2
        [[1, 1], [0, 2]], //cond 7
        [[1, 1], [0, 2]], // cond 8
        [[1, 1], [0, 2]], //cond 9
    ];

    probs['reward'] = [
        // opt 1  // opt2
        [[1, 1], [.25, .75]],//cond7
        [[1, 1], [.5, .5]],//cond8
        [[1, 1], [.75, .25]],//cond9
    ];

    var cond = [];
    cond['neutral'] = [0, 1, 2];
    cond['punishment'] = [3, 4, 5];
    cond['reward'] = [6, 7, 8];

    var expCondition = [];
    var conditions = [];

    for (let i = 0; i < nSessions; i++) {

        let idxNeutral = randint(
            0,
            cond['neutral'].length - 1
        );

        let idxPunish = randint(
            0,
            cond['punishment'].length - 1
        );

        let idxReward = randint(
            0,
            cond['reward'].length - 1
        );

        // pop cond number
        let condN = cond['neutral'].splice(idxNeutral, 1)[0];
        let condP = cond['punishment'].splice(idxPunish, 1)[0];
        let condR = cond['reward'].splice(idxReward, 1)[0];

        expCondition[i] = shuffle(
            Array(nTrialsPerSession / nCondPerSession).fill([condN, condP, condR]).flat()
        );
    }

    let framing = ['neutral', 'punishment', 'reward'];
    let nFraming = framing.length;

    for (let i = 0; i < nFraming; i++)
        for (let j = 0; j < nSessions; j++)
            conditions.push({
                reward: rewards[framing[i]][j],
                prob: probs[framing[i]][j]
            });

    var trainingCondition = shuffle(
        Array(nTrialTrainingPerCond).fill([1, 4, 7]).flat()
    );

    var lotteriesCondition = shuffle(
        Array(nTrialsPerConditionLot).fill(range(0, nCond)).flat()
    );

    // Get stims, feedbacks, resources
    // -------------------------------------------------------------------------------------------------------- //
    var imgPath = 'images/cards_gif/';
    var nImg = 18;
    var imgExt = 'gif';
    var borderColor = "transparent";

    var images = [];
    var availableOptions = [];
    for (let i = 1; i <= nImg; i++) {
        availableOptions.push(i);
        images[i] = new Image();
        images[i].src = imgPath + 'stim_old/' + i + '.' + imgExt;
        images[i].className = "img-responsive center-block";
        images[i].style.border = "5px solid " + borderColor;
        images[i].style.position = "relative";
        images[i].style.top = "0px";
    }

    var feedbackNames = ["empty", "0", "1", "-1", '-2', '2'];
    var feedbackImg = [];
    for (var i = 0; i < feedbackNames.length; i++) {
        fb = feedbackNames[i];
        feedbackImg[fb] = new Image();
        feedbackImg[fb].src = imgPath + 'fb/' + fb + '.' + imgExt;
        feedbackImg[fb].className = "img-responsive center-block";
        feedbackImg[fb].style.border = "5px solid " + borderColor;
        feedbackImg[fb].style.position = "relative";
        feedbackImg[fb].style.top = "0px";
    }

    var lotteriesImg = [];
    for (let i = 1; i <= nImg / 2; i++) {
        for (let j = 1; j <= 2; j++) {
            lotteriesImg[i + '_' + j] = new Image();
            lotteriesImg[i + '_' + j].src = imgPath + 'lotteries/' + i + '_' + j + '.' + imgExt;
            lotteriesImg[i + '_' + j].className = "img-responsive center-block";
            lotteriesImg[i + '_' + j].style.border = "5px solid " + borderColor;
            lotteriesImg[i + '_' + j].style.position = "relative";
            lotteriesImg[i + '_' + j].style.top = "0px";
        }

    }

    // Training stims
    var trainingImg = [];
    var trainingOptions = [];
    for (let i = nImg + 1; i <= nTrainingImg + nImg; i++) {
        trainingOptions.push(i);
        trainingImg[i] = new Image();
        trainingImg[i].src = imgPath + 'stim_old/' + i + '.' + imgExt;
        trainingImg[i].className = "img-responsive center-block";
        trainingImg[i].style.border = "5px solid " + borderColor;
        trainingImg[i].style.position = "relative";
        trainingImg[i].style.top = "0px";
    }
    trainingOptions = shuffle(trainingOptions);

    // create training contexts
    var trainingContexts = [];
    var arr = [];
    (new Set(trainingCondition)).forEach(x => arr.push(x));
    let j = 0;
    for (let i = 0; i < nTrainingImg; i += 2) {
        trainingContexts[arr[j]] = [
            trainingOptions[i], trainingOptions[i + 1]
        ];
        j++;
    }

    // Randomize
    availableOptions = shuffle(availableOptions);
    var contexts = [];

    for (let i = 0; i < nImg; i += 2) {
        contexts.push([
            availableOptions[i], availableOptions[i + 1]
        ]);
    }

    contexts = shuffle(contexts);

    // Run the experiment
    // ------------------------------------------------------------------------------------------------ //
    getUserID();


    // function send(call, url, data) {
    //     $.ajax({
    //         type: 'POST',
    //         async: true,
    //         url: url,
    //         data: data,
    //         success: function (r) {
    //             if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
    //                 send(call + 1, url, data);
    //             }
    //         },
    //         error: function (xhr, textStatus, err) {
    //         },
    //     });
    // }
    //
    function sendExpDataDB(call) {

        $.ajax({
            type: 'POST',
            async: true,
            url: 'php/InsertExpDetails.php',
            //contentType: "application/json; charset=utf-8",
            //dataType: 'json',

            data: {expID: expID, id: subID, exp: expName, browser: browsInfo},

            success: function (r) {
                if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                    sendExpDataDB(call + 1);
                }
            },
            error: function (xhr, textStatus, err) {
            },
        });
    }

    function playTraining(trialNum) {

        if ($('#TextBoxDiv').length === 0) {
            createDiv('Stage', 'TextBoxDiv');
            /*document.getElementById("TextBoxDiv").style.backgroundColor = "white";*/
        }

        var conditionIdx = trainingCondition[trialNum];
        var option1ImgIdx = trainingContexts[conditionIdx][0];
        var option2ImgIdx = trainingContexts[conditionIdx][1];

        var option1 = trainingImg[option1ImgIdx];
        option1.id = "option1";
        option1 = option1.outerHTML;

        var option2 = trainingImg[option2ImgIdx];
        option2.id = "option2";
        option2 = option2.outerHTML;

        var feedback1 = feedbackImg["empty"];
        feedback1.id = "feedback1";
        feedback1 = feedback1.outerHTML;

        var feedback2 = feedbackImg["empty"];
        feedback2.id = "feedback2";
        feedback2 = feedback2.outerHTML;

        var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';


        // Create canevas for the slot machine effect, of the size of the images
        var canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback1 + '' +
            '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + feedback2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var invertedPosition = +(Math.random() < 0.5);
        var symbols = [option1ImgIdx, option2ImgIdx];

        if (invertedPosition) {

            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + option2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + option1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';
            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback2 + '</div><div id = "Middle" class="col-xs-4 col-md-4">' +
                '</div><div class="col-xs-3 col-md-3">' + feedback1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div>' +
                '<div class="col-xs-1 col-md-1"></div></div>';

            var symbols = [option2ImgIdx, option1ImgIdx];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

        var choiceTime = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !invertedPosition) || (key === 112 && invertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(1);
                color = getColor(fb);
                document.getElementById("option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key === 112 && !invertedPosition) || (key === 101 && invertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(2);
                color = getColor(fb);
                document.getElementById("option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });

        function getReward(choice) {

            var reactionTime = (new Date()).getTime();

            var leftRight = -1;

            if ((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2))) {
                leftRight = 1;
            }

            var P1 = conditions[conditionIdx]['prob'][0][1];
            var P2 = conditions[conditionIdx]['prob'][1][1];
            var Mag1 = conditions[conditionIdx]['reward'][0];
            var Mag2 = conditions[conditionIdx]['reward'][1];

            p1 = conditions[conditionIdx]['prob'][0];
            p2 = conditions[conditionIdx]['prob'][1];
            r1 = conditions[conditionIdx]['reward'][0];
            r2 = conditions[conditionIdx]['reward'][1];

            if (sum(p1) === 2) {
                var ev1 = p1[0] * r1[0];
            } else {
                var ev1 = p1.reduce(
                    function (r, a, i) {
                        return r + a * r1[i]
                    }, 0);
            }

            if (sum(p2) === 2) {
                var ev2 = p2[0] * r2[0];
            } else {
                var ev2 = p2.reduce(
                    function (r, a, i) {
                        return r + a * r2[i]
                    }, 0);
            }

            if (choice === 1) { /*option1*/
                var thisReward = Mag1[+(Math.random() < P1)];
                var otherReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev1 > ev2);
            } else { /*option2*/
                var otherReward = Mag1[+(Math.random() < P1)];
                var thisReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev2 > ev1);
            }

            sumReward += thisReward;

            var fb1 = document.getElementById("feedback1");
            var fb2 = document.getElementById("feedback2");

            var pic1 = document.getElementById("option1");
            var pic2 = document.getElementById("option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            if (choice === 1) {
                fb1.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic1, cv1);
                }, 500)

            } else {
                fb2.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic2, cv2);
                }, 500)

            }

            if (offline === 0) sendTrainDataDB(0);

            next();

            function slideCard(pic, cv) {  /* faire défiler la carte pour decouvrir le feedback */

                var img = new Image();
                img.src = pic.src;
                img.width = pic.width;
                img.height = pic.height;

                var speed = 3; /*plus elle est basse, plus c'est rapide*/
                var y = 0; /*décalage vertical*/

                /*Programme principal*/

                var dy = 10;
                var x = 0;
                var ctx;

                img.onload = function () {

                    canvas = cv;
                    ctx = cv.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    var scroll = setInterval(draw, speed);

                    setTimeout(function () {
                        pic.style.visibility = "hidden";
                        clearInterval(scroll);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }, 1000);
                };

                function draw() {

                    ctx.clearRect(0, 0, canvas.width, canvas.height); /* clear the canvas*/

                    if (y > img.height) {
                        y = -img.height + y;
                    }

                    if (y > 0) {
                        ctx.drawImage(img, x, -img.height + y, img.width, img.height);
                    }

                    ctx.drawImage(img, x, y, img.width, img.height);

                    /*quantité à déplacer*/
                    y += dy;
                }
            };

            function sendTrainDataDB(call) {

                var wtest = 0; /* training */

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        trial: trialNum,
                        condition: conditionIdx,
                        symL: symbols[0],
                        symR: symbols[1],
                        choice: choice,
                        correct_choice: correctChoice,
                        outcome: thisReward,
                        cf_outcome: otherReward,
                        choice_left_right: leftRight,
                        reaction_time: reactionTime - choiceTime,
                        reward: sumReward,
                        session: trainSess,
                        p1: P1,
                        p2: P2,
                        option1: option1ImgIdx,
                        option2: option2ImgIdx,
                        inverted: invertedPosition,
                        choice_time: choiceTime - initTime
                    },
                    async: true,
                    url: 'php/InsertLearningDataDB.php',

                    success: function (r) {

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            sendTrainDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {

                        // what type of error is it
                        alert(errorThrown.responseText);

                        if (call + 1 < maxDBCalls) {
                            sendTrainDataDB(call + 1);
                        }
                    }
                });
            };  /* function sendTrainDataDB(call) */

            return thisReward;
        };  /* function getReward(Choice) */

        function next() {

            trialNum++;
            if (trialNum < nTrainingTrials) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        playTraining(trialNum);
                    }, 500);
                }, feedbackDuration);
            } else {
                trainSess--;
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        endTrainingStartSessions();
                    }, 500);
                }, feedbackDuration);
            }
        } /* function next() */
    };  /* function playTraining(trialNum) */

    function endTrainingStartSessions() {

        // InsertLog(0,'train');

        var nPages = 2; /*number of pages  */

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';

        var instBut;
        var trainBut;
        var startBut;

        var ready;
        var steady;
        var go;

        var Info = '';

        var points = sumReward;
        var pence = pointsToPence(points);
        var pounds = pointsToPounds(points);

        var wonlost = [' you won ', ' you lost '][+(points < 0)];

        Info += '<H3 align = "center">In this training,' + wonlost + points + ' points = ' + pence + ' pence = ' + pounds + ' pounds!</h3><br><br>';

        sumReward = 0;

        Info += '<H3 align = "center">Now, you are about to start the first phase of the test.<br>Click on start when you are ready.</h3><br><br>';

        instBut = '"Return to instructions"';
        trainBut = '"play the practice again"';
        startBut = '"Start the game"';
        ready = 'Ready...';
        steady = 'Steady...';
        go = 'Go!';

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center">';
        if (trainSess > -(maxTrainingSessions + 1)) {
            Buttons += '<input align="center" type="button"  class="btn btn-default" id="Train" value=' + trainBut + ' >\n\ ';
        }
        Buttons += '<input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' >';
        Buttons += '</div>';

        $('#Bottom').html(Buttons);

        $('#Inst').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(1);

        });

        $('#Train').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            playTraining(0);

        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            setTimeout(function () {
                $('#Stage').html('<H1 align = "center">' + ready + '</H1>');
                setTimeout(function () {
                    $('#Stage').html('<H1 align = "center">' + steady + '</H1>');
                    setTimeout(function () {
                        $('#Stage').html('<H1 align = "center">' + go + '</H1>');
                        setTimeout(function () {
                            $('#Stage').empty();
                            playSessions(0, 0);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    }

    // function startSessions() {
    //
    //     var nPages = 2;/*number of pages*/
    //
    //     createDiv('Stage', 'TextBoxDiv');
    //
    //     var Title = '<H2 align = "center"></H2>';
    //
    //     var Info;
    //     var instBut;
    //     var trainBut;
    //     var startBut;
    //
    //     var ready;
    //     var steady;
    //     var go;
    //
    //     Info = '<H3 align = "center">Now, you are about to start the game.<br>Click on start when you are ready.</h3><br><br>';
    //
    //     instBut = "Return to instructions";
    //     trainBut = "play the practice again";
    //     startBut = "Start the game";
    //
    //     ready = 'Ready';
    //     steady = 'Steady';
    //     go = 'Go!';
    //
    //     $('#TextBoxDiv').html(Title + Info);
    //
    //     var Buttons = '<div align="center">';
    //     if (trainSess > -(maxTrainingSessions + 1)) {
    //         Buttons += '<input align="center" type="button"  class="btn btn-default" id="Train" value=' + trainBut + ' >\n\ ';
    //     }
    //     Buttons += '<input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' >';
    //     Buttons += '</div>';
    //
    //     $('#Bottom').html(Buttons);
    //
    //     $('#Inst').click(function () {
    //
    //         $('#TextBoxDiv').remove();
    //         $('#Stage').empty();
    //         $('#Bottom').empty();
    //         instructions(1);
    //
    //     });
    //
    //     $('#Train').click(function () {
    //
    //         $('#TextBoxDiv').remove();
    //         $('#Stage').empty();
    //         $('#Bottom').empty();
    //         playTraining(0);
    //
    //     });
    //
    //     $('#Start').click(function () {
    //
    //         $('#TextBoxDiv').remove();
    //         $('#Stage').empty();
    //         $('#Bottom').empty();
    //         setTimeout(function () {
    //             $('#Stage').html('<H1 align = "center">' + ready + '</H1>');
    //             setTimeout(function () {
    //                 $('#Stage').html('<H1 align = "center">' + steady + '</H1>');
    //                 setTimeout(function () {
    //                     $('#Stage').html('<H1 align = "center">' + go + '</H1>');
    //                     setTimeout(function () {
    //                         $('#Stage').empty();
    //                         playSessions(0, 0);
    //                     }, 1000);
    //                 }, 1000);
    //             }, 1000);
    //         }, 10);
    //     });
    // } /* function startSessions() */

    function playSessions(sessionNum, trialNum) {

        playOptions(sessionNum, trialNum);
    } /* function playSessions(sessionNum) */

    function playOptions(sessionNum, trialNum) {

        if ($('#TextBoxDiv').length === 0) {
            createDiv('Stage', 'TextBoxDiv');
            /*document.getElementById("TextBoxDiv").style.backgroundColor = "white";*/
        }

        /*Choisir une condition*/
        var conditionIdx = expCondition[sessionNum][trialNum];

        var option1ImgIdx = contexts[conditionIdx][0];
        var option2ImgIdx = contexts[conditionIdx][1];

        var option1 = images[option1ImgIdx];
        option1.id = "option1";
        option1 = option1.outerHTML;

        var option2 = images[option2ImgIdx];
        option2.id = "option2";
        option2 = option2.outerHTML;

        var feedback1 = feedbackImg["empty"];
        feedback1.id = "feedback1";
        feedback1 = feedback1.outerHTML;

        var feedback2 = feedbackImg["empty"];
        feedback2.id = "feedback2";
        feedback2 = feedback2.outerHTML;

        var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';

        // var Count = '<div id = "Count"><H3 align = "center">Your current amount: ' + parseInt(sumReward) + ' points<br><br><br><br></H3><div>';

        // Create canevas for the slot machine effect, of the size of the images

        var canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';
               /* Create canevas for the slot machine effect, of the size of the images */

        // var P1 = conditions[conditionIdx]['prob'][0][1];
        // var P2 = conditions[conditionIdx]['prob'][1][1];
        // var Mag1 = conditions[conditionIdx]['reward'][0];
        // var Mag2 = conditions[conditionIdx]['reward'][1];
        //
        // p1 = conditions[conditionIdx]['prob'][0];
        // p2 = conditions[conditionIdx]['prob'][1];
        // r1 = conditions[conditionIdx]['reward'][0];
        // r2 = conditions[conditionIdx]['reward'][1];
        //
        // if (sum(p1) === 2) {
        //     var ev1 = p1[0] * r1[0];
        // } else {
        //     var ev1 = p1.reduce(
        //         function (r, a, i) {
        //             return r + a * r1[i]
        //         }, 0);
        // }
        //
        // if (sum(p2) === 2) {
        //     var ev2 = p2[0] * r2[0];
        // } else {
        //     var ev2 = p2.reduce(
        //         function (r, a, i) {
        //             return r + a * r2[i]
        //         }, 0);
        // }
        //
        // if (ev1 > ev2) {
        //     canvas2 = canvas2.replace('name="best"', '');
        // } else if (ev1 === ev2) {
        //     if (Math.random() > 0.5)
        //         canvas1 = canvas1.replace('name="best"', '');
        //     else
        //         canvas2 = canvas2.replace('name="best"', '');
        // } else {
        //     canvas1 = canvas1.replace('name="best"', '');
        // }

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback1 + '' +
            '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + feedback2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var invertedPosition = +(Math.random() < 0.5);
        var symbols = [option1ImgIdx, option2ImgIdx];

        if (invertedPosition) {

            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + option2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + option1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';
            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback2 + '</div><div id = "Middle" class="col-xs-4 col-md-4">' +
                '</div><div class="col-xs-3 col-md-3">' + feedback1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div>' +
                '<div class="col-xs-1 col-md-1"></div></div>';

            var symbols = [option2ImgIdx, option1ImgIdx];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

        var choiceTime = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !invertedPosition) || (key === 112 && invertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(1);
                color = getColor(fb);
                document.getElementById("option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key === 112 && !invertedPosition) || (key === 101 && invertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(2);
                color = getColor(fb);
                document.getElementById("option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });

        function getReward(choice) {

            var reactionTime = (new Date()).getTime();

            var leftRight = -1;

            if ((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2))) {
                leftRight = 1;
            }

            var P1 = conditions[conditionIdx]['prob'][0][1];
            var P2 = conditions[conditionIdx]['prob'][1][1];
            var Mag1 = conditions[conditionIdx]['reward'][0];
            var Mag2 = conditions[conditionIdx]['reward'][1];

            p1 = conditions[conditionIdx]['prob'][0];
            p2 = conditions[conditionIdx]['prob'][1];
            r1 = conditions[conditionIdx]['reward'][0];
            r2 = conditions[conditionIdx]['reward'][1];

            if (sum(p1) === 2) {
                var ev1 = p1[0] * r1[0];
            } else {
                var ev1 = p1.reduce(
                    function (r, a, i) {
                        return r + a * r1[i]
                    }, 0);
            }

            if (sum(p2) === 2) {
                var ev2 = p2[0] * r2[0];
            } else {
                var ev2 = p2.reduce(
                    function (r, a, i) {
                        return r + a * r2[i]
                    }, 0);
            }

            if (choice === 1) { /*option1*/
                var thisReward = Mag1[+(Math.random() < P1)];
                var otherReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev1 > ev2);
            } else { /*option2*/
                var otherReward = Mag1[+(Math.random() < P1)];
                var thisReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev2 > ev1);
            }

            sumReward += thisReward;

            var fb1 = document.getElementById("feedback1");
            var fb2 = document.getElementById("feedback2");

            var pic1 = document.getElementById("option1");
            var pic2 = document.getElementById("option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            if (choice === 1) {
                fb1.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic1, cv1);
                }, 500)

            } else {
                fb2.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic2, cv2);
                }, 500)

            }

            if (offline === 0) sendLearnDataDB(0);

            next();

            function slideCard(pic, cv) {  /* faire défiler la carte pour decouvrir le feedback */

                var img = new Image();
                img.src = pic.src;
                img.width = pic.width;
                img.height = pic.height;

                var speed = 3; /*plus elle est basse, plus c'est rapide*/
                var y = 0; /*décalage vertical*/

                /*Programme principal*/

                var dy = 10;
                var x = 0;
                var ctx;

                img.onload = function () {

                    canvas = cv;
                    ctx = cv.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    var scroll = setInterval(draw, speed);

                    setTimeout(function () {
                        pic.style.visibility = "hidden";
                        clearInterval(scroll);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }, 1000);
                };

                function draw() {

                    ctx.clearRect(0, 0, canvas.width, canvas.height); /* clear the canvas*/

                    if (y > img.height) {
                        y = -img.height + y;
                    }

                    if (y > 0) {
                        ctx.drawImage(img, x, -img.height + y, img.width, img.height);
                    }

                    ctx.drawImage(img, x, y, img.width, img.height);

                    /*quantité à déplacer*/
                    y += dy;
                }
            }

            function sendLearnDataDB(call) {
                wtest = 1;

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        trial: trialNum,
                        condition: conditionIdx,
                        symL: symbols[0],
                        symR: symbols[1],
                        choice: choice,
                        correct_choice: correctChoice,
                        outcome: thisReward,
                        cf_outcome: otherReward,
                        choice_left_right: leftRight,
                        reaction_time: reactionTime - choiceTime,
                        reward: sumReward,
                        session: sessionNum,
                        p1: P1,
                        p2: P2,
                        option1: option1ImgIdx,
                        option2: option2ImgIdx,
                        inverted: invertedPosition,
                        choice_time: choiceTime - initTime
                    },
                    async: true,
                    url: 'php/InsertLearningDataDB.php',
                    /*dataType: 'json',*/
                    success: function (r) {

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            sendLearnDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {

                        if (call + 1 < maxDBCalls) {
                            sendLearnDataDB(call + 1);
                        }
                    }
                });
            };

            return thisReward;
        };  /* function getReward(Choice) */


        function next() {
            trialNum++;
            if (trialNum < nTrialsPerSession) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        playOptions(sessionNum, trialNum);
                    }, 500);
                }, feedbackDuration);

            } else {
                trialNum = 0;
                sessionNum++;
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        nextSession(sessionNum, trialNum);
                    }, 500);
                }, feedbackDuration);
            }
        } /* function next() */
    };  /* function playOptions(sessionNum,trialNum) */

    function nextSession(sessionNum, trialNum) {
        // InsertLog(0,'learn');
        if (sessionNum < nSessions) {
            endSession(sessionNum, trialNum);
        } else {
            if (questionnaire) {
                startLotteries(1);
                //startQuestionnaire();
            } else {
                endExperiment();
            }
        }
    } /* function nextSession(sessionNum) */

    function endSession(sessionNum, trialNum) {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">SESSION</H2>';

        var points = sumReward;
        var pence = pointsToPence(points);
        var pounds = pointsToPounds(points);

        var wonlost;
        var Info;
        var nextBut;

        wonlost = [' won ', ' lost '][+(points < 0)];
        Info = '<H3 align = "center">So far, you have ' + wonlost + points + ' points = ' + pence +
            ' pence = ' + pounds + ' pounds!<br><br> Click when you are ready to continue';
        nextBut = '"Next"';


        $('#TextBoxDiv').html(Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Next" value=' + nextBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Next').click(function () {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            playSessions(sessionNum, trialNum);

        })
    } /* function endSession(sessionNum) */

    function startLotteries(pageNum) { /*text to uncomment for information*/

        var nPages = 2;
        var points = sumReward;
        var pence = pointsToPence(points);
        var pounds = pointsToPounds(points);

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">PHASE 2</H3>';

        switch (pageNum) {

            case 1:
                var wonlost = [' won ', ' lost '][+(points < 0)];
                var Info = '<H3 align="center"><br>You finished the first phase of the cognitive experiment.<br>'
                    + 'So far you have ' + wonlost + points + ' points = ' + pence + ' pence = ' + pounds + 'pounds!<br></h3><br><br>';
                break;

            case 2:
                var Info = '<H3 align="center">You will now start the second phase of the task.<br><br>' +
                    'Once again, you have to select one of the two options by clicking on it.<br><br>' +
                    'The only difference is that instead of pictures, the percent chance of winning (or losing) 0, 1, 2, is now directly displayed.<br><br>' +
                    'Click when you are ready</h3>';
                break;

            default:
                var Info;
                break;
        }

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
        <input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
        <input align="center" type="button"  class="btn btn-default" id="Start" value="Start!" ></div>';

        $('#Bottom').html(Buttons);

        if (pageNum === 1) {
            $('#Back').hide();
        }
        ;

        if (pageNum === nPages) {
            $('#Next').hide();
        }
        ;

        if (pageNum < nPages) {
            $('#Start').hide();
        }
        ;

        $('#Back').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            startLotteries(pageNum - 1);
        });

        $('#Next').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            startLotteries(pageNum + 1);

        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            setTimeout(function () {
                $('#Stage').html('<H1 align = "center">Ready...</H1>');
                setTimeout(function () {
                    $('#Stage').html('<H1 align = "center">Steady...</H1>');
                    setTimeout(function () {
                        $('#Stage').html('<H1 align = "center">Go!</H1>');
                        setTimeout(function () {
                            $('#Stage').empty();
                            playLotteries(0);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    }

    function playLotteries(trialNum) {

        if ($('#TextBoxDiv').length === 0) {
            createDiv('Stage', 'TextBoxDiv');
            /*document.getElementById("TextBoxDiv").style.backgroundColor = "white";*/
        }

        /*Choisir une condition*/
        var conditionIdx = lotteriesCondition[trialNum];

        var option1 = lotteriesImg[(conditionIdx + 1) + '_' + 1];
        option1.id = "option1";
        option1 = option1.outerHTML;

        var option2 = lotteriesImg[(conditionIdx + 1) + '_' + 2];
        option2.id = "option2";
        option2 = option2.outerHTML;

        var feedback1 = feedbackImg["empty"];
        feedback1.id = "feedback1";
        feedback1 = feedback1.outerHTML;

        var feedback2 = feedbackImg["empty"];
        feedback2.id = "feedback2";
        feedback2 = feedback2.outerHTML;

        var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';

        //var Count = '<div id = "Count"><H3 align = "center">Your current amount: ' + parseInt(sumReward) + ' points<br><br><br><br></H3><div>';

        // Create canevas for the slot machine effect, of the size of the images
        var canvas1 = '<canvas id="canvas1" height="620" width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';
        var canvas2 = '<canvas id="canvas2" height="620" width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
            '<div class="col-xs-1 col-md-1"></div><div class="col-xs-3 col-md-3">' +
            option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback1 + '</div>'  +
            '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + feedback2 +
            '</div><div class="col-xs-1 col-md-1"></div></div>';

        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas1 + '</div>' +
            '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas2 +
            '</div><div class="col-xs-1 col-md-1"></div></div>';

        var invertedPosition = +(Math.random() < 0.5);
        var symbols = [-1, -1];

        if (invertedPosition) {
            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                '<div class="col-xs-1 col-md-1"></div><div class="col-xs-3 col-md-3">' +
                option2 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
                '<div class="col-xs-3 col-md-3">' + option1 + '</div><div class="col-xs-1 col-md-1"></div></div>';

            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
                '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback2 + '</div>'  +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + feedback1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';

            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';

            var symbols = [-1, -1];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

        var choiceTime = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !invertedPosition) || (key === 112 && invertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(1);
                color = getColor(fb);
                document.getElementById("option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key === 112 && !invertedPosition) || (key === 101 && invertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(2);
                color = getColor(fb);
                document.getElementById("option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });


        function getReward(choice) {

            var reactionTime = (new Date()).getTime();

            // choice is left
            var leftRight = -1;

            if ((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2))) {
                // choice is right
                leftRight = 1;
            }

            var P1 = conditions[conditionIdx]['prob'][0][1];
            var P2 = conditions[conditionIdx]['prob'][1][1];
            var Mag1 = conditions[conditionIdx]['reward'][0];
            var Mag2 = conditions[conditionIdx]['reward'][1];

            p1 = conditions[conditionIdx]['prob'][0];
            p2 = conditions[conditionIdx]['prob'][1];
            r1 = conditions[conditionIdx]['reward'][0];
            r2 = conditions[conditionIdx]['reward'][1];

            if (sum(p1) === 2) {
                var ev1 = p1[0] * r1[0];
            } else {
                var ev1 = p1.reduce(
                    function (r, a, i) {
                        return r + a * r1[i]
                    }, 0);
            }

            if (sum(p2) === 2) {
                var ev2 = p2[0] * r2[0];
            } else {
                var ev2 = p2.reduce(
                    function (r, a, i) {
                        return r + a * r2[i]
                    }, 0);
            }

            if (choice === 1) { /*option1*/
                var thisReward = Mag1[+(Math.random() < P1)];
                var otherReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev1 > ev2);
            } else { /*option2*/
                var otherReward = Mag1[+(Math.random() < P1)];
                var thisReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev2 > ev1);
            }

            sumReward += thisReward;

            var fb1 = document.getElementById("feedback1");
            var fb2 = document.getElementById("feedback2");

            var pic1 = document.getElementById("option1");
            var pic2 = document.getElementById("option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            if (choice === 1) {
                fb1.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic1, cv1);
                }, 500)
            } else {
                fb2.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic2, cv2);
                }, 500)
            }

            if (offline === 0) sendLotteriesDataDB(0);

            next();

            function slideCard(pic, cv) {  /* faire défiler la carte pour decouvrir le feedback */

                var img = new Image();
                img.src = pic.src;
                img.width = pic.width;
                img.height = pic.height;

                var speed = 3; /*plus elle est basse, plus c'est rapide*/
                var y = 0; /*décalage vertical*/

                /*Programme principal*/

                var dy = 10;
                var x = 0;
                var ctx;

                img.onload = function () {

                    /*récupérer le contexte du canvas*/

                    canvas = cv;
                    ctx = cv.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    /*définir le taux de rafraichissement*/
                    var scroll = setInterval(draw, speed);

                    setTimeout(function () {
                        pic.style.visibility = "hidden";
                        clearInterval(scroll);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }, 1000);
                }

                function draw() {

                    ctx.clearRect(0, 0, canvas.width, canvas.height); /* clear the canvas*/

                    /*réinitialise, repart du début*/
                    if (y > img.height) {
                        y = -img.height + y;
                    }

                    /*dessine image1 supplémentaire*/
                    if (y > 0) {
                        ctx.drawImage(img, x, -img.height + y, img.width, img.height);
                    }

                    /*dessine image*/
                    ctx.drawImage(img, x, y, img.width, img.height);

                    /*quantité à déplacer*/
                    y += dy;
                }
            };

            function sendLotteriesDataDB(call) {

                var wtest = 1; /* learning test */

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        trial: trialNum,
                        condition: conditionIdx,
                        symL: symbols[0],
                        symR: symbols[1],
                        choice: choice,
                        correct_choice: correctChoice,
                        outcome: thisReward,
                        cf_outcome: otherReward,
                        choice_left_right: leftRight,
                        reaction_time: reactionTime - choiceTime,
                        reward: sumReward,
                        session: 3,
                        p1: P1,
                        p2: P2,
                        option1: (conditionIdx + 1) * 10 + 1,
                        option2: (conditionIdx + 1) * 10 + 2,
                        inverted: invertedPosition,
                        choice_time: choiceTime - initTime
                    },
                    async: true,
                    url: 'php/InsertLearningDataDB.php',
                    /*dataType: 'json',*/
                    success: function (r) {

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            sendLotteriesDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {

                        if (call + 1 < maxDBCalls) {
                            sendLotteriesDataDB(call + 1);
                        }
                    }
                });
            };

            return thisReward;
        };  /* function getReward(Choice) */


        function next() {
            trialNum++;
            if (trialNum < nTrialsLotteries) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        playLotteries(trialNum);
                    }, 500);
                }, feedbackDuration);

            } else {
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        startReasoningTest();
                    }, 500);
                }, feedbackDuration);
            }
        }
    };

    function startReasoningTest() {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">QUESTIONNAIRE</H3>';

        var startBut;

        startBut = '"Start"'
        var Info = '<H3 align = "center">You are now about to start the third phase.<br>' +
            'You will see several items that vary in difficulty. Please answer as many as you can.</H3><br><br>';

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            playQuestionnaire_CRT(1);
        });
    };  /* function startQuestionnaire() */

    function playQuestionnaire_CRT(questNum) {

        var NumQuestions = 7; /*mettre a jour le nombre de pages (questions) via le script*/

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 7;

        switch (questNum) {

            case 1:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'A bat and a ball cost £1.10 in total. The bat costs £1.00 more than the ball. How much does the ball cost?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 5 pence </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 10 pence </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 9 pence </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 1 pence </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 1;

                break;

            case 2:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 5 minutes </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 100 minutes </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 20 minutes </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 500 minutes </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 2;

                break;

            case 3:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 47 days </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 24 days </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 12 days </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 36 days </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 3;

                break;

            case 4:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'If John can drink one barrel of water in 6 days, and Mary can drink one barrel of water in 12 days, how long would it take them to drink one barrel of water together?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 4 days </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 9 days </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 12 days </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 3 days </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 4;

                break;

            case 5:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Jerry received both the 15th highest and the 15th lowest mark in the class. How many students are in the class?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 29 students </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 30 students </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 1 student </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 15 students </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 5;

                break;

            case 6:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'A man buys a pig for £60, sells it for £70, buys it back for £80, and sells it finally for £90. How much has he made?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 20 pounds </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 10 pounds </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 0 pounds </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 30 pounds </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 6;

                break;

            case 7:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Simon decided to invest £8,000 in the stock market one day early in 2008.  Six months after he invested, on July 17, the stocks he had purchased were down 50%. ' +
                    'Fortunately for Simon, from July 17 to October 17, the stocks he had purchased went up 75%. At this point, Simon:' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> has lost money. </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> is ahead of where he began. </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> has broken even in the stock market. </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> it cannot be determined. </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 7;

                break;

            default:
                break;
        }
        var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">'
            + '<input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {
                alert('Please select one answer.');

            } else {

                Reaction_time = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('value')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                if (offline == 0) sendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    questNum += nb_skip + 1;
                } else {
                    questNum++;
                }

                if (questNum <= NumQuestions) {
                    playQuestionnaire_CRT(questNum);
                } else {
                    startQuestionnaire();
                }
            }
            ;
        });

        function sendQuestDataDB(call) {

            $.ajax({
                type: 'POST',
                data: {
                    exp: expName,
                    expID: expID,
                    id: subID,
                    qid: questID,
                    qnum: 1,
                    item: itemNum,
                    ans: answer,
                    val: answer_value,
                    reaction_time: Reaction_time - Question_time
                },
                async: true,
                url: 'php/InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        sendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {

                    if (call + 1 < maxDBCalls) {
                        sendQuestDataDB(call + 1);
                    }
                }
            });
        }
    }

    function startQuestionnaire() {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">QUESTIONNAIRE</H3>';

        var startBut;

        startBut = '"Start"'
        var Info = '<H3 align = "center">You will now have to answer a few questions.<br><br>This won\'t take more than a few more minutes.<br><br>Your answers remain anonymous and will not be disclosed.<br><br>' +
            'Note that the experiment will be considered completed (and the payment issued) only if the questionnaires are correctly filled.<br><br>' +
            'Please click "Start" when you are ready.</H3><br><br>';

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            playQuestionnaire_SES(1);
        });
    }

    function playQuestionnaire_SES(questNum) {

        var NumQuestions = 13; /*mettre a jour le nombre de pages (questions) via le script*/

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var reactionTime;

        var nb_skip = 0;

        var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">'
            + '<input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

        switch (questNum) {

            case 1:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'The following questions measure your perception of your childhood and your current adult life. Please indicate your agreement with these statements. Please read each statement carefully, and then indicate how much you agree with the statement.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> I am ready. </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13_instruction";
                itemNum = 1;

                break;

            case 2:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was growing up, someone in my house was always yelling at someone else.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 1;

                break;

            case 3:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Some of the punishments I received when I was a child now seem too harsh to me.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 2;

                break;

            case 4:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'I guess you could say that I wasn’t treated as well as I should have been at home.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 3;

                break;

            case 5:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, things were often chaotic in my house.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 4;

                break;

            case 6:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, people often moved in and out of my house on a pretty random basis.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 5;

                break;

            case 7:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, I had a hard time knowing what my parents or other people in my house were going to say or do from day-to-day.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 6;

                break;

            case 8:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, my family usually had enough money for things when I was growing up.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 7;

                break;

            case 9:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, I grew up in a relatively wealthy neighborhood.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 8;

                break;

            case 10:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, I felt relatively wealthy compared to the other kids in my school.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 9;

                break;

            case 11:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Now as an adult, I have enough money to buy things I want.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 10;

                break;

            case 12:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Now as an adult, I don\'t need to worry too much about paying my bills.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 11;

                break;

            case 13:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Now as an adult, I don\'t think I\'ll have to worry about money too much in the future.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 12;

                break;

            case 14:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Think of this ladder as representing where people stand in their communities. ' +
                    'People define community in different ways: please define it in whatever way is most meaningful to you.<br>' +
                    'At the top of the ladder are the people who have the highest standing in their community.' +
                    'At the bottom are the people who have the lowest standing in their community.<br><br>' +
                    'Where would you place yourself on this ladder?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="10" name= "answer" value= 10> <label for="10"> 10 Top - highest standing </label><br>' +
                    '<input type= "radio" id="9"  name= "answer" value= 9>  <label for="9"> 9 </label><br>' +
                    '<input type= "radio" id="8"  name= "answer" value= 8>  <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="7"  name= "answer" value= 7>  <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="6"  name= "answer" value= 6>  <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="5"  name= "answer" value= 5>  <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="4"  name= "answer" value= 4>  <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="3"  name= "answer" value= 3>  <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="2"  name= "answer" value= 2>  <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="1"  name= "answer" value= 1>  <label for="1"> 1 Bottom - lower standing </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 13;

                break;
            default:

                break;

        }

        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {

                alert('Please select one answer.');

            } else {

                reactionTime = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('id')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                if (offline === 0) sendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer === -1) {
                    questNum += nb_skip + 1;
                } else {
                    questNum++;
                }

                if (questNum <= NumQuestions + 1) {
                    playQuestionnaire_SES(questNum);
                } else {
                    endExperiment();
                }
            }
            ;
        });

        function sendQuestDataDB(call) {

            $.ajax({
                type: 'POST',
                data: {
                    exp: expName,
                    expID: expID,
                    id: subID,
                    qid: questID,
                    qnum: 5,
                    item: itemNum,
                    ans: answer,
                    val: answer_value,
                    reaction_time: reactionTime - Question_time
                },
                async: true,
                url: 'php/InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        sendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {

                    if (call + 1 < maxDBCalls) {
                        sendQuestDataDB(call + 1);
                    }
                }
            });
        }
    }

    function endExperiment() {

        createDiv('Stage', 'TextBoxDiv');

        var points = sumReward;
        var pence = pointsToPence(points);
        var pounds = pointsToPounds(points);

        var wonlost = [' won ', ' lost '][+(points < 0)];

        var Title = '<h3 align = "center">The game is over!<br>' +
            'You ' + wonlost + points + ' points in total, which is ' + pence + ' pence = ' + pounds + ' pounds!<br><br>' +
            'Thank you for playing!<br><br>Please click the link to complete this study:<br></h3><br>';
        var url = '';
        if (compLink)
            url = '<center><a href="' + link + '">Click here.</a></center>';

        $('#TextBoxDiv').html(Title + url);
    }

    //  Non-game / display text functions
    // ------------------------------------------------------------------------------------------------------------------------------------------ //

    function getUserID() {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">Please enter your Prolific ID: <input type="text" id = "textbox_id" name="ID"></H3>';
        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toConsent" value="Next" ></div>';

        var TextInput = '';
        $('#TextBoxDiv').html(Title + TextInput);

        $('#Bottom').html(Buttons);

        $('#toConsent').click(function () {

            if (document.getElementById('textbox_id').value != '') {

                subID = document.getElementById('textbox_id').value;
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                consent();
            } else {
                alert('You must enter your Prolific ID.');
            }
        });

    }
    function consent() {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">CONSENT</H2><br>';

        var Info = '<H4>INFORMATION FOR THE PARTICIPANT</H4>' +
            'You are about to participate in the research study entitled:<br>' +
            'The domain-general role of reinforcement learning-based training in cognition across short and long time-spans<br>' +
            'Researcher in charge: Pr. Stefano PALMINTERI<br>' +
            'This study aims to understand the learning processes in decision-making. Its fundamental purpose is to investigate the cognitive mechanisms of these' +
            'learning and decision-making processes.' +
            'The proposed experiments have no immediate application or clinical value, but they will allow us to improve our understanding of the functioning brain.<br>' +
            'We are asking you to participate in this study because you have been recruited by the RISC or Prolific platforms. <br>' +
            '<H4>PROCEDURE</H4>' +
            'During your participation in this study, we will ask you to answer several simple questionnaires and tests, which do not require any particular competence.' +
            'Your internet-based participation will require approximately 30 minutes. <br>' +
            '<H4>VOLUNTARY PARTICIPATION AND CONFIDENTIALITY</H4>' +
            'Your participation in this study is voluntary. This means that you are consenting to participate in this project without external pressure.' +
            'During your participation in this project, the researcher in charge and his staff will collect and record information about you.<br>' +
            'In order to preserve your identity and the confidentiality of the data, the identification of each file will be coded, thus preserving the anonymity of your answers. ' +
            'We will not collect any personal data from the RISC or Prolific platforms.<br>' +
            'The researcher in charge of this study will only use the data for research purposes in order to answer the scientific objectives of the project.' +
            'The data may be published in scientific journals and shared within the scientific community,' +
            'in which case no publication or scientific communication will contain identifying information. <br>' +
            '<H4>RESEARCH RESULTS AND PUBLICATION</H4>' +
            'You will be able to check the publications resulting from this study on the following link:<br>' +
            'https://sites.google.com/site/stefanopalminteri/publications<br>' +
            '<H4>CONTACT AND ADDITIONAL INFORMATION</H4>' +
            'Email: humanreinforcementlearning@gmail.com<br>' +
            'This research has received a favorable opinion from the Inserm Ethical Review Committee / IRB0888 on November 13th, 2018.<br>' +
            'Your participation in this research confirms that you have read this information and wish to participate in the research study.<br><br>' +
            '<H4>Please check all boxes before starting:<H4>';

        var Ticks = '<H4><input type="checkbox" name="consent" value="consent1"> I am 18 years old or more<br>' +
            '<input type="checkbox" name="consent" value="consent2"> My participation in this experiment is voluntary <br>' +
            '<input type="checkbox" name="consent" value="consent3"> I understand that my data will be kept confidential and I can stop at any time without justification <br></H4>';

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toInstructions" value="Next" ></div>';

        $('#TextBoxDiv').html(Title + Info + Ticks);
        $('#Bottom').html(Buttons);

        $('#toInstructions').click(function () {
            if ($("input:checkbox:not(:checked)").length > 0) {
                alert('You must tick all check boxes to continue.');
            } else {
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                instructions();
            }
        });
    }  /* function consent() */

    function instructions(pageNum=1) {

        var nPages = 5;/*number of pages*/

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">INSTRUCTIONS</H2>';

        switch (pageNum) {

            case 1:
                var Info = '<H3 align = "center">This experiment is composed of four phases.<br><br>' +
                    'The first and the second phases consist in performing a cognitive test.<br><br>' +
                    'The third phase is composed of questions assessing reasoning.<br><br>' +
                    'The final phase is a questionnaire about your perceived economic status.<br><br> </H3>';
                break;

            case 2:
                var Info = '<H3 align = "center">In the cognitive experiment, your final payoff will depend on your choices.<br><br>'
                    + 'The game is divided into 3 sessions, each of which will last approximately 8 minutes and include 60 rounds.<br><br>'
                    + 'Before the first session there will be a short training session of about 15 rounds.<br><br>'
                    + 'The word "ready" will be displayed before the game starts.<br><br>'
                break;

            case 3:
                var Info = '<H3 align = "center">In each round you have to choose between one of two symbols displayed on either side of the screen.<br><br>'
                    + 'You can select one of the two symbols with a left-click.'
                    + 'After a choice, you can win/lose the following outcomes:<br><br>'
                    + '0 point = 0 pence<br>1 point = 7.5 pence<br>2 points = 15 pence<br><br'
                    + '<br>-1 point = -7.5 pence<br>-2 points = -15 pence<br><br>'
                    + 'Across the two phases of the cognitive experiment, you can win up to 33 points = 2.47 pounds.<br><br></H3>';
                break;

            case 4:
                var Info = '<H3 align = "center">The outcome of your choice will appear in the location of the symbol you chose.<br><br>'
                    + 'The different symbols are most of the time not equal in terms of outcome: in most trials of the experiment<br><br>'
                    + 'one is in average more advantageous (‘lucky’) compared to the other in terms of both points to be won, as well as points not to be lost.<br><br>'
                    + 'Your task is to find out, by trial and error, which is the most advantageous stimulus and win as many points as possible,'
                    + 'even if it’s not possible to win points on every round. '
                break;

            case 5:
                var Info = '<H3 align = "center">At the end of the experiment you will know the total amount of points you won.<br><br>'
                    + 'The points won during the experiment will be translated into actual money, which will affect your final payment.<br><br>'
                    + 'Since the total number of trials is fixed, your final payoff depends only your capacity to identify the advantageous stimuli and not on your rapidity.<br><br>'
                    + 'Let\'s begin with a training!<br><br>'
                    + '(points won during the training do not count for the final payoff)<br><br></H3>';
                break;

            default:
                var Info;
                break;

        }

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
		<input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
		<input align="center" type="button"  class="btn btn-default" id="Start" value="Start!" ></div>';

        $('#Bottom').html(Buttons);

        if (pageNum === 1) {
            $('#Back').hide();
        }

        if (pageNum === nPages) {
            $('#Next').hide();
        }

        if (pageNum < nPages) {
            $('#Start').hide();
        }

        $('#Back').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (pageNum === 1) {
            } else {
                instructions(pageNum - 1);
            }

        });
        $('#Next').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(pageNum + 1);

        });
        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (offline === 0) sendExpDataDB(0);
            playTraining(0);

        });
    }

    function GetUserInfo() {

        createDiv('Stage', 'TextBoxDiv');
        var Title = '<H3 align = "center">Please indicate your</H3><br>';
        var Age = '<div align="center">Age: <input type="text" id = "age_id" name="age"><br></div>';
        var Gender = '<div align="center">Gender: <input type= "radio" id="m" name= "gender" >Male'
            + '<input type= "radio" id="f" name= "gender">Female<br></div>';

        $('#TextBoxDiv').html(Title + Age + '<br><br>' + Gender);

        var Buttons = '<div align="center"><input align="center" type="button"'
            + 'class="btn btn-default" id="toQuestions" value="Next" ></div>';
        $('#Bottom').html(Buttons);

        $('#toQuestions').click(function () {
            age_val = parseInt(document.getElementById('age_id').value);

            if (($("input:radio:checked").length < 1)
                || isNaN(age_val) || (age_val < 0) || (age_val > 100)) {
                alert('Please fill the required fields.');
            } else {
                gender_val = $("input:radio:checked").attr('id');
                if (offline == 0) sendUserDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                playQuestionnaire(1);
            }
        });

        function sendUserDataDB() {
            $.ajax({
                type: 'POST',
                data: {id: subID, age: age_val, gender: gender_val},
                async: true,
                url: 'php/InsertSubDetails.php',
                /*dataType: 'json',*/
                success: function (r) {
                    if (r[0].ErrorNo > 0) {
                        /*subID = createCode();*/
                        /*RunExperiment(thisAge, thisEdu, thisSex);*/
                        /*DisplayError();*/
                    } else {
                        /*playSessions(0);*/
                    }
                    ;
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus);
                    alert("Error: " + errorThrown);
                }
            });
        }
    }

    //  Utils
    // ------------------------------------------------------------------------------------------------------------------------------------------ //

    function getKeyCode(event) {

        return event.which;
    }

    function getColor(FB) {
        color = borderColor;
        if (FB == 0) {
            color = "black";
        } else if (FB == 1) {
            color = "#07ed19";
        } else if (FB == -1) {
            color = "#f20202";
        } else if (FB == 0.1) {
            color = "#1bb527";
        } else if (FB == -0.1) {
            color = "#ba1616";
        }
        return color;
    }

    function createCode() {
        return Math.floor(Math.random() * 10000000000);
    }

    function createDiv(ParentID, ChildID) {

        var d = $(document.createElement('div'))
            .attr("id", ChildID);
        var container = document.getElementById(ParentID);
        d.appendTo(container);
    }

    function shuffle(array) {
        let counter = array.length;

        /* While there are elements in the array */
        while (counter > 0) {
            /* Pick a random index */
            let index = Math.floor(Math.random() * counter);

            /* Decrease counter by 1 */
            counter--;

            /* And swap the last element with it */
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }  /* function shuffle(array) */

    // simple range function
    function range(start, stop, step) {
        var a = [start], b = start;
        while (b < stop) {
            a.push(b += step || 1);
        }
        return a;
    }

    /**
     * Asserts a condition
     * @param condition
     * @param message
     */
    function assert(condition, message) {
        if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
                throw new Error(message);
            }
            throw message; // Fallback
        }
    }

    const sum = arr => arr.reduce((a, b) => a + b, 0);

    function randint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getBrowser() {

        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        /*In Opera, the true version is after "Opera" or after "Version"*/
        if ((verOffset = nAgt.indexOf("Opera")) != -1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf("Version")) != -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }

        /*In MSIE, the true version is after "MSIE" in userAgent*/
        else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
            browserName = "Microsoft Internet Explorer";
            fullVersion = nAgt.substring(verOffset + 5);
        }

        /*In Chrome, the true version is after "Chrome"*/
        else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset + 7);
        }

        /*In Safari, the true version is after "Safari" or after "Version"*/
        else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
            browserName = "Safari";
            fullVersion = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf("Version")) != -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }

        /*In Firefox, the true version is after "Firefox"*/
        else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
            browserName = "Firefox";
            fullVersion = nAgt.substring(verOffset + 8);
        }

        /*In most other browsers, "name/version" is at the end of userAgent*/
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);
            if (browserName.toLowerCase() == browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }

        if ((ix = fullVersion.indexOf(";")) != -1)
            fullVersion = fullVersion.substring(0, ix);
        if ((ix = fullVersion.indexOf(" ")) != -1)
            fullVersion = fullVersion.substring(0, ix);

        majorVersion = parseInt('' + fullVersion, 10);

        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        return browserName + ' ' + fullVersion + ' ' + majorVersion + ' ' + navigator.appName + ' ' + navigator.userAgent;
    } /* function getBrowser() */

    function getOS() {
        var OSName = "Unknown OS";
        if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
        return OSName;
    }
});



