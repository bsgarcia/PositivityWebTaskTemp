$(document).ready(function () {

    /*Initial Experiment Parameters*/
    var expName = 'Positivity';
    var language = "en";
    var compLink = 1;
    var nSessions = 3;
    var nTrainingTrials = 8;//1;
    var nTrialsLotteries = 18;
    var questionnaire = 1;
    var maxTrainingSessions = 2;
    var nCond = 9;
    // because of range
    nCond--;
    var nCondPerSession = 3;
    var nTrialsPerCondition = 20;
    var nTrialsPerSession = nTrialsPerCondition * ((nCond + 1) / nSessions);
    var nTrialsPerConditionLot = 2;

    var offline = 0;

    var imgPath = 'images/cards_gif/';
    var nImg = 18;
    var imgExt = 'gif';

    var feebackDuration = 2000;
    var borderColor = "transparent";

    var probs = [];
    var rewards = [];

    rewards['neutral'] = [
        [[0, 0], [0, 1]],
        [[0, 0], [0, 1]],
        [[0, 0], [0, 1]],
    ];

    probs['neutral'] = [
        [[1, 1], [.25, .75]], //cond1
        [[1, 1], [.5, .5]], // cond2
        [[1, 1], [.75, .25]], //cond3
    ];

    rewards['punishment'] = [
        [[-1, -1], [-2, 0]],
        [[-1, -1], [-2, 0]],
        [[-1, -1], [-2, 0]],
    ];

    probs['punishment'] = [
        [[1, 1], [.25, .75]], //cond4
        [[1, 1], [.5, .5]],  //cond5
        [[1, 1], [.75, .25]], //cond6
    ];

    rewards['reward'] = [
        [[1, 1], [1, 2]],
        [[1, 1], [1, 2]],
        [[1, 1], [1, 2]],
    ];

    probs['reward'] = [
        [[1, 1], [.25, .75]],//cond7
        [[1, 1], [.5, .5]],//cond8
        [[1, 1], [.75, .25]],//cond9
    ];

    var cond = [];
    cond['neutral'] = [0, 1, 2];
    cond['punishment'] = [3, 4, 5];
    cond['reward'] = [6, 7, 8];

    var sessionConds = [];
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
            cond['punishment'].length - 1
        );

        // pop cond number
        let condN = cond['neutral'].splice(idxNeutral, 1)[0];
        let condP = cond['punishment'].splice(idxPunish, 1)[0];
        let condR = cond['reward'].splice(idxReward, 1)[0];

        sessionConds[i] = shuffle(Array(nTrialsPerSession / nCondPerSession).fill([condN, condP, condR]).flat());
    }

    var nTotalTrials = sessionConds.flat().length;
    console.log('N total Trials: ' + nTotalTrials);

    let framing = ['neutral', 'punishment', 'reward'];
    let nFraming = framing.length;

    for (let i = 0; i < nFraming; i++)
        for (let j = 0; j < nSessions; j++)
            conditions.push({
                reward: rewards[framing[i]][j],
                prob: probs[framing[i]][j]
            });


    // conditions: Target neutre 1:3, P(0)=1 vs. P(+1)=75,50,25, 0 otherwise
    // conditions: Target punishment 1:3, P(-1)=1 vs. P(0)=75,50,25, -2 otherwise
    // conditions: Target reward 1:3, P(+1)=1 vs. P(+2)=75,50,25, , +1 otherwise

    var trainingConditions = range(0, nTrainingTrials);
    var lotteriesConds = shuffle(Array(nTrialsPerConditionLot).fill(range(0, nCond)).flat());

    /* On recupere les options disponibles */
    var images = [];
    var availableOptions = [];
    for (let i = 1; i <= nImg; i++) {
        availableOptions.push(i);
        images[i] = new Image();
        images[i].src = imgPath + 'stim_old/' + i + '.' + imgExt;
        images[i].className = "img-responsive center-block";
        images[i].style.border = "5px solid " + borderColor;
        images[i].style.position = "relative";
//        images[i].style.paddingBottom = "0.9em";
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

    /*On les randomise*/
    availableOptions = shuffle(availableOptions);
    var contexts = [];

    for (let i = 0; i < nImg; i += 2) {
        contexts.push([
            availableOptions[i], availableOptions[i + 1]
        ]);
    }

    contexts = shuffle(contexts);

    var sumReward = 0;
    var totalReward = 0;

    var initTime = (new Date()).getTime();

    var expID = CreateCode();

    var clickDisabled = false;
    var trainSess = -1;
    var maxDBCalls = 1;
    var browsInfo = GetOS() + ' - ' + GetBrowser();

    var log = '';
    var clog = '';

    var subID = expID;

    var link = 'https://app.prolific.ac/';

    GetUserID();

    function Consent() {

        CreateDiv('Stage', 'TextBoxDiv');

        if (language == 'en') {
            var Title = '<H2 align = "center">Consent</H2><br>';

            var Info = '<H4>INFORMATION FOR THE PARTICIPANT</H4>' +
                'You are about to participate in the research study entitled:<br>' +
                'The domain-general role of reinforcement learning-based training in cognition across short and long time-spans<br>' +
                'Researcher in charge: Pr. Stefano PALMINTERI<br>' +
                'This study aims to understand the learning processes in decision-making. Its fundamental purpose is to investigate the cognitive mechanisms of these learning and decision-making processes. The proposed experiments have no immediate application or clinical value, but they will allow us to improve our understanding of the functioning brain.<br>' +
                'We are asking you to participate in this study because you have been recruited by the RISC or Prolific platforms. <br>' +
                '<H4>PROCEDURE</H4>' +
                'During your participation in this study, we will ask you to answer several simple questionnaires and tests, which do not require any particular competence. Your internet-based participation will require approximately 30 minutes. <br>' +
                '<H4>VOLUNTARY PARTICIPATION AND CONFIDENTIALITY</H4>' +
                'Your participation in this study is voluntary. This means that you are consenting to participate in this project without external pressure. During your participation in this project, the researcher in charge and his staff will collect and record information about you.<br>' +
                'In order to preserve your identity and the confidentiality of the data, the identification of each file will be coded, thus preserving the anonymity of your answers. We will not collect any personal data from the RISC or Prolific platforms.<br>' +
                'The researcher in charge of this study will only use the data for research purposes in order to answer the scientific objectives of the project. The data may be published in scientific journals and shared within the scientific community, in which case no publication or scientific communication will contain identifying information. <br>' +
                '<H4>RESEARCH RESULTS AND PUBLICATION</H4>' +
                'You will be able to check the publications resulting from this study on the following link:<br>' +
                'https://sites.google.com/site/stefanopalminteri/publications<br>' +
                '<H4>CONTACT AND ADDITIONAL INFORMATION</H4>' +
                'Email: humanreinforcementlearning@gmail.com<br>' +
                'This research has received a favorable opinion from the Inserm Ethical Review Committee / IRB00003888 on November 13th, 2018.<br>' +
                'Your participation in this research confirms that you have read this information and wish to participate in the research study.<br><br>' +
                '<H4>Please check all boxes before starting:<H4>';

            var Ticks = '<H4><input type="checkbox" name="consent" value="consent1"> I am 18 years old or more<br>' +
                '<input type="checkbox" name="consent" value="consent2"> My participation in this experiment is voluntary <br>' +
                '<input type="checkbox" name="consent" value="consent3"> I understand that my data will be kept confidential and I can stop at any time without justification <br></H4>';

            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toInstructions" value="Next" ></div>';
        } else if (language == 'fr') {
            var Title = '<H2 align = "center">Consentement</H2><br>';
            var Info = '<H4>INFORMATION A L’ATTENTION DU PARTICIPANT</H4>' +
                'Nous vous proposons de participer à la recherche intitulée :<br>' +
                'The domain-general role of reinforcement learning-based training in cognition across short and long time-spans<br>' +
                'Sous la direction du Pr. Stefano PALMINTERI,<br>' +
                'visant à comprendre les processus d’apprentissage dans la prise de décision. Cette recherche a une visée fondamentale. Nous visons à comprendre les processus cognitifs de ces processus d’apprentissage et prise de décision et nous n’envisageons aucune application immédiate pour ces recherches. Les tests proposés n’ont aucune valeur clinique, cependant ils nous permettront d’avancer nos connaissances sur le fonctionnement du cerveau.<br>' +
                'Nous vous sollicitons pour participer à cette étude car vous avez été recruté par la plateforme RISC ou Prolific. <br>' +
                '<H4>PROCEDURE</H4>' +
                'Lors de votre participation à cette étude, nous vous demanderons de répondre à plusieurs questionnaires et tests simples, qui ne nécessitent pas de compétence particulière. Votre participation repose sur des réponses sur internet d’une durée de à peu près 30 minutes. <br>' +
                '<H4>PARTICIPATION VOLONTAIRE ET CONFIDENTIALITE</H4>' +
                'Votre participation à cette étude est volontaire. Cela signifie que vous acceptez de participer à ce projet sans pression extérieure ou contrainte. Durant votre participation à ce projet, le chercheur responsable ainsi que son personnel recueilleront et consigneront dans un dossier les renseignements vous concernant.<br>' +
                'Afin de préserver votre identité ainsi que la confidentialité des données, l’identification de chaque dossier se fera par un numéro de code, préservant ainsi l’anonymat de vos réponses et nous ne demanderons aucune donnée personnelle au RISC ou a Prolific.<br>' +
                'Le chercheur responsable de cette étude n’utilisera les données qu’à des fins de recherche, dans le but de répondre aux objectifs scientifiques du projet. Les données pourront être publiées dans des revues scientifiques et partagées au sein de la communauté scientifique. Aucune publication ou communication scientifique ne renfermera d’information permettant de vous identifier. <br>' +
                '<H4>RESULTATS DE LA RECHERCHE ET PUBLICATION</H4>' +
                'Vous pourrez consulter les publications issues de cette étude sur le lien suivant :<br>' +
                'https://sites.google.com/site/stefanopalminteri/publications<br>' +
                '<H4>CONTACT ET INFORMATIONS SUPPLEMENTAIRES</H4>' +
                'Email: humanreinforcementlearning@gmail.com<br>' +
                'Cette recherche a reçu un avis favorable du comité d’évaluation éthique de l’Inserm/IRB00003888 le 13 novembre 2018.<br>' +
                'Votre participation à cette recherche confirme que vous avez lu ces informations et acceptez de participer à cette étude.<br><br>' +
                '<H4>Veuillez cocher toutes les cases avant de commencer :<H4>';

            var Ticks = '<H4><input type="checkbox" name="consent" value="consent1"> J\'ai plus de 18 ans<br>' +
                '<input type="checkbox" name="consent" value="consent2"> Je suis volontaire pour participer à cette étude <br>' +
                '<input type="checkbox" name="consent" value="consent3"> Je comprends que mes données seront confidentielles et je peux abandonner l\'expérience sans justification<br></H4>';

            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toInstructions" value="Suivant" ></div>';
        }

        $('#TextBoxDiv').html(Title + Info + Ticks);
        $('#Bottom').html(Buttons);

        $('#toInstructions').click(function () {
            if ($("input:checkbox:not(:checked)").length > 0) {
                alert('You must tick all check boxes to continue.');
            } else {
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                /*subID = GetUserID();*/
                Instructions(1);
            }
            ;
        });
    };  /* function Consent() */

    function Instructions(pageNum) {

        var nPages = 5;/*number of pages*/

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">Instructions</H2>';

        switch (pageNum) {

            case 1:
                if (language === 'en') {
                    var Info = '<H3 align = "center">This experiment is composed of four phases.<br><br>' +
                        'The first and the second phases consist in performing a cognitive test.<br><br>' +
                        'The third phase is composed of questions assessing reasoning.<br><br>' +
                        'The final phase is a questionnaire about your perceived economic status.<br><br> </H3>';
                } else if (language === 'fr') {
                    var Info = '<H3 align = "center">Cette expérience se déroule en quatre parties.<br><br>' +
                        'Les première et deuxième parties consistent à réaliser un test cognitif.<br><br>' +
                        'La troisième partie est composée de quelques questions visant à mesurer votre raisonnement.<br><br>' +
                        'La dernière partie est un questionnaire sur la perception de votre statut économique.<br><br> </H3>';
                }
                break;

            case 2:
                if (language === 'en') {
                    var Info = '<H3 align = "center">In the cognitive experiment, your final payoff will depend on your choices.<br><br>'
                        + 'The game is divided into 3 sessions, each of which will last approximately 8 minutes and include 60 rounds.<br><br>'
                        + 'Before the first session there will be a short training session of about 32 rounds.<br><br>'
                        + 'The word "ready" will be displayed before the game starts.<br><br>'
                } else if (language == 'fr') {
                    var Info = '<H3 align = "center">Dans l\'expérience cognitive, votre indemnité finale dépendra de vos choix.<br><br>' +
                        'Vous pouvez maximiser vos gains en trouvant quelle option vous fera gagner le plus de points.<br><br>' +
                        'Pour chaque choix que vous ferez, vous verrez le nombre de points que vous avez gagnés.<br><br>' +
                        'A la fin de l\'expérience, nous calculerons la somme cumulée des points que vous aurez gagnés et nous convertirons ce score en argent réel selon la règle suivante.<br><br> </H3>';
                }
                break;

            case 3:
                if (language == 'en') {
                    var Info = '<H3 align = "center">In each round you have to choose between one of two symbols displayed on either side of the screen.<br><br>'
                        + 'You can select one of the two symbols with a left-click.'
                        + 'After a choice, you can win or lose the following outcomes:<br><br>'
                        + '0 point = 0 pence<br>1 point = 3 pence<br>2 points = 6 pence<br><br>'
                        + 'Across the two phases of the cognitive experiment, you can win up to 164 points = 4.92 pounds.<br><br></H3>';
                } else if (language == 'fr') {
                    var Info = '<H3 align = "center">Après avoir fait votre choix, vous pouvez gagner les points suivants:<br><br>' +
                        '0 point = 0,0 centimes<br>1 point = 0,5 centimes<br>10 points = 5,0 centimes<br><br>' +
                        'Après les deux phases cognitives, vous pouvez gagner jusqu\'à 1095 points = 5,475 euros.<br><br></H3>';
                }
                break;

            case 4:
                if (language == 'en') {
                    var Info = '<H3 align = "center">The outcome of your choice will appear in the location of the symbol you chose.<br><br>'
                        + 'The different symbols are most of the time not equal in terms of outcome: in most trials of the experiment<br><br>'
                        + 'one is in average more advantageous (‘lucky’) compared to the other in terms of both points to be won, as well as points not to be lost.<br><br>'
                        + 'Your task is to find out, by trial and error, which is the most advantageous stimulus and win as many points as possible,'
                        + 'even if it’s not possible to win points on every round. '
                } else if (language == 'fr') {
                    var Info = '<H3 align = "center">A chaque nouvel essai, vous devez choisir entre deux images abstraites en cliquant sur une image.<br><br>' +
                        'Retenez bien que, en moyenne, chaque image vous donnera plus de points que l\'autre. Le côté (gauche/droite) n\'a aucune importance.<br><br>' +
                        'Vous pouvez maximiser vos gains en choisissant à chaque fois les images avec la plus grande valeur moyenne.<br><br></H3>';
                }
                break;

            case 5:
                if (language == 'en') {
                    var Info = '<H3 align = "center">At the end of the experiment you will know the total amount of points you won.<br><br>'
                        + 'The points won during the experiment will be translated into actual money, which will affect your final payment.<br><br>'
                        + 'Since the total number of trials is fixed, your final payoff depends only your capacity to identify the advantageous stimuli and not on your rapidity.<br><br>'
                        + 'Let\'s begin with a training!<br><br>'
                        + '(points won during the training do not count for the final payoff)<br><br></H3>';
                } else if (language == 'fr') {
                    var Info = '<H3 align = "center">Commençons avec un entrainement !<br><br>' +
                        '(les points gagnés durant l\'entraînement ne comptent pas pour le gain final)<br><br></H3>';
                }
                break;

            default:
                var Info;
                break;

                PlayTraining(0);
        }
        ;

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
		<input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
		<input align="center" type="button"  class="btn btn-default" id="Start" value="Start!" ></div>';

        if (language == 'en') {
            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Start" value="Start!" ></div>';

        } else if (language == 'fr') {
            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Précédent" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Next" value="Suivant" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Start" value="Commencer !" ></div>';

        }

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

            if (pageNum === 1) {
                Information();
            } else {
                Instructions(pageNum - 1);
            }

        });
        $('#Next').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            Instructions(pageNum + 1);

        });
        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (offline == 0) SendExpDataDB(0);
            PlayTraining(0);

        });
    };  /* function Instructions(PageNum) */

    function SendExpDataDB(call) {

        clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ BROW: ' + browsInfo;
        /*clog=JSON.stringify(clog);*/
        //data = {key: "value"}
        /*console.log(clog)*/

        $.ajax({
            type: 'POST',
            async: true,
            url: 'InsertExpDetails.php',
            //contentType: "application/json; charset=utf-8",
            //dataType: 'json',

            data: {expID: expID, id: subID, exp: expName, browser: browsInfo},

            success: function (r) {
                clog = 'experiment_data $ ' + clog + ' $ dbcall success \n';
                log += clog;
                InsertLog(0, 'exp');
                /*alert(r);*/

                if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                    SendExpDataDB(call + 1);
                }
            },
            error: function (xhr, textStatus, err) {
            },
        });
    } /* function SendExpDataDB(call) */

    function InsertLog(call, ext) {

        /*tosend: ID, questionnaire, question, answer*/

        $.ajax({
            type: 'POST',
            data: {expID: expID, id: subID, exp: expName, log: log, ext: ext},
            async: true,
            url: 'InsertLog.php',
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                clog = 'insertlog failure call ' + call + ' - status: ' + textStatus + ' - error: ' + errorThrown + '\n';
                log += clog;
                msg = "Internet connection";
                if (language == 'en') {
                    msg = "Please verify your internet connection before continuing the experiment";
                } else if (language == 'fr') {
                    msg = "Veuillez vérifier votre connexion internet avant de continuer";
                }

                InsertLog(call + 1, ext);
            }
        });
    } /* function InsertLog(call,ext) */

    function PlayTraining(TrialNum) {

        if ($('#TextBoxDiv').length == 0) {
            CreateDiv('Stage', 'TextBoxDiv');
            /*document.getElementById("TextBoxDiv").style.backgroundColor = "white";*/
        }

        var Condition = trainingConditions[TrialNum];
        var option1_image_idx = contexts[Condition][0];
        var option2_image_idx = contexts[Condition][1];

        var Option1 = images[option1_image_idx];
        Option1.id = "Option1";
        Option1 = Option1.outerHTML;

        var Option2 = images[option2_image_idx];
        Option2.id = "Option2";
        Option2 = Option2.outerHTML;

        var FB1 = feedbackImg["empty"];
        FB1.id = "FB1";
        FB1 = FB1.outerHTML;

        var FB2 = feedbackImg["empty"];
        FB2.id = "FB2";
        FB2 = FB2.outerHTML;

        if (language == 'en') {
            //var Title = '<div id = "Title"><H2 align = "center">Click on the slot machine of your choice<br><br><br><br></H2></div>';
            var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';
        } else if (language == 'fr') {
            var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';
        }

        var Count = '<div id = "Count"><H3 align = "center">Your current amount: ' + parseInt(sumReward) + ' points<br><br><br><br></H3><div>';

        /* Create canevas for the slot machine effect, of the size of the images */

        var canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + Option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + Option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + FB1 + '' +
            '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + FB2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var InvertedPosition = +(Math.random() < 0.5);
        var Symbols = [option1_image_idx, option2_image_idx];

        if (InvertedPosition) {

            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + Option2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + Option1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';
            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + FB2 + '</div><div id = "Middle" class="col-xs-4 col-md-4">' +
                '</div><div class="col-xs-3 col-md-3">' + FB1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div>' +
                '<div class="col-xs-1 col-md-1"></div></div>';

            var Symbols = [option2_image_idx, option1_image_idx];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

        var Choice_time = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !InvertedPosition) || (key === 112 && InvertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = Reward(1);
                color = getColor(fb);
                document.getElementById("Option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key === 112 && !InvertedPosition) || (key === 101 && InvertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = Reward(2);
                color = getColor(fb);
                document.getElementById("Option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = Reward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = Reward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });


        function Reward(Choice) {

            var Reaction_time = (new Date()).getTime();

            var left_right = -1;

            if ((InvertedPosition && (Choice === 1)) || (!InvertedPosition && (Choice === 2))) {
                left_right = 1;
            }

            var P1 = conditions[Condition]['prob'][0][1];
            var P2 = conditions[Condition]['prob'][1][1];
            var Mag1 = conditions[Condition]['reward'][0];
            var Mag2 = conditions[Condition]['reward'][1];

            p1 = conditions[Condition]['prob'][0];
            p2 = conditions[Condition]['prob'][1];
            r1 = conditions[Condition]['reward'][0];
            r2 = conditions[Condition]['reward'][1];

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

            if (Choice === 1) { /*Option1*/
                ThisReward = Mag1[+(Math.random() < P1)];
                OtherReward = Mag2[+(Math.random() < P2)];
                correctChoice = +(ev1 > ev2);
            } else { /*Option2*/
                OtherReward = Mag1[+(Math.random() < P1)];
                ThisReward = Mag2[+(Math.random() < P2)];
                correctChoice = +(ev2 > ev1);
            }

            sumReward += ThisReward;

            var fb1 = document.getElementById("FB1");
            var fb2 = document.getElementById("FB2");

            var pic1 = document.getElementById("Option1");
            var pic2 = document.getElementById("Option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            /*if(Info===1)
				feebackDuration = feebackDuration+500;*/

            if (Choice == 1) {
                fb1.src = feedbackImg['' + ThisReward].src;
                setTimeout(function () {

                    slideCard(pic1, cv1);

                    // if (Info === 1) {
                    //     fb2.src = feedbackImg['cf_' + OtherReward].src;
                    //     slideCard(pic2, cv2);
                    // }

                }, 500)

            } else {

                fb2.src = feedbackImg['' + ThisReward].src;
                setTimeout(function () {

                    slideCard(pic2, cv2);

                    // if (Info === 1) {
                    //     fb1.src = feedbackImg['cf_' + OtherReward].src;
                    //     slideCard(pic1, cv1);
                    // }

                }, 500)

            }

            if (offline == 0) SendTrainDataDB(0);

            Next();

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

            function SendTrainDataDB(call) {

                var wtest = 0; /* training */

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        trial: TrialNum,
                        condition: Condition,
                        symL: Symbols[0],
                        symR: Symbols[1],
                        choice: Choice,
                        correct_choice: correctChoice,
                        outcome: ThisReward,
                        cf_outcome: OtherReward,
                        choice_left_right: left_right,
                        reaction_time: Reaction_time - Choice_time,
                        reward: sumReward,
                        correct_choice: correctChoice,
                        session: trainSess,
                        p1: P1,
                        p2: P2,
                        option1: option1_image_idx,
                        option2: option2_image_idx,
                        inverted: InvertedPosition,
                        choice_time: Choice_time - initTime
                    },
                    async: true,
                    url: 'InsertLearningDataDB.php',

                    success: function (r) {
                        clog = 'learning_data $ ' + clog + ' $ dbcall success \n';
                        log += clog; //update log before not after because variables get changed

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            SendTrainDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        clog = 'learning_data $ ' + clog + ' $ dbcall failure \n';
                        log += clog;

                        // what type of error is it
                        alert(errorThrown.responseText);

                        if (call + 1 < maxDBCalls) {
                            SendTrainDataDB(call + 1);
                        }
                    }
                });
            };  /* function SendTrainDataDB(call) */

            return ThisReward;
        };  /* function Reward(Choice) */

        function Next() {

            TrialNum++;
            if (TrialNum < nTrainingTrials) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        PlayTraining(TrialNum);
                    }, 500);
                }, feebackDuration);
            } else {
                trainSess--;
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        EndTrainingStartSessions();
                    }, 500);
                }, feebackDuration);
            }
        } /* function Next() */
    };  /* function PlayTraining(TrialNum) */

    function EndTrainingStartSessions() {

        // InsertLog(0,'train');

        var NumPages = 2; /*number of pages  */

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';

        var instBut;
        var trainBut;
        var startBut;

        var ready;
        var steady;
        var go;

        var Info = '';

        var toprint = sumReward;
        var wonlost;
        if (language == 'en') {
            wonlost = ' you won ';
            if (toprint < 0) {
                wonlost = ' you lost ';
            }

            Info += '<H3 align = "center">In this training,' + wonlost + toprint + ' points = ' + toprint * 0.03 + ' pence!</h3><br><br>';
        } else if (language == 'fr') {
            wonlost = ' gagné ';
            if (toprint < 0) {
                wonlost = ' perdu ';
            }

            Info += '<H3 align = "center">Dans cet entrainement, vous avez' + wonlost + toprint + ' points = ' + toprint * 0.03 + ' centimes !</h3><br><br>';
        }

        sumReward = 0;

        if (language == 'en') {
            Info += '<H3 align = "center">Now, you are about to start the first phase of the test.<br>Click on start when you are ready.</h3><br><br>';

            instBut = '"Return to instructions"';
            trainBut = '"Play the practice again"';
            startBut = '"Start the game"';
            ready = 'Ready...';
            steady = 'Steady...';
            go = 'Go!'
        } else if (language == 'fr') {
            Info += '<H3 align = "center">Maintenant, vous allez commencer la première partie du test.<br><br>Cliquez sur commencer dès que vous êtes prêt.</h3><br><br>';

            instBut = '"Retourner aux instructions"';
            trainBut = '"Rejouer l\'entrainement"';
            startBut = '"Commencer le jeu"';
            ready = 'A vos marques...';
            steady = 'Prêt ?';
            go = 'Partez !'
        }

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
            Instructions(1);

        });

        $('#Train').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            PlayTraining(0);

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
                            PlaySessions(0, 0);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    } /* function EndTrainingStartSessions() */

    function StartSessions() {

        var NumPages = 2;/*number of pages*/

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';

        var Info;
        var instBut;
        var trainBut;
        var startBut;

        var ready;
        var steady;
        var go;

        if (language == 'en') {
            Info = '<H3 align = "center">Now, you are about to start the game.<br>Click on start when you are ready.</h3><br><br>';

            instBut = "Return to instructions";
            trainBut = "Play the practice again";
            startBut = "Start the game";

            ready = 'Ready';
            steady = 'Steady';
            go = 'Go!'

        } else if (language == 'fr') {

            Info = '<H3 align = "center">Maintenant, vous allez commencer le jeu.<br>Cliquez sur commencer dès que vous êtes prêt.</h3><br><br>';

            instBut = '"Retourner aux instructions"';
            trainBut = '"Rejouer l\'entrainement"';
            startBut = '"Commencer le jeu"';

            ready = 'A vos marques...';
            steady = 'Prêt ?';
            go = 'Partez !'
        }

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
            Instructions(1);

        });

        $('#Train').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            PlayTraining(0);

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
                            PlaySessions(0, 0);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    } /* function StartSessions() */

    function PlaySessions(SessionNum, TrialNum) {

        PlayOptions(SessionNum, TrialNum);
    } /* function PlaySessions(SessionNum) */

    function PlayOptions(SessionNum, TrialNum) {

        if ($('#TextBoxDiv').length === 0) {
            CreateDiv('Stage', 'TextBoxDiv');
            /*document.getElementById("TextBoxDiv").style.backgroundColor = "white";*/
        }

        /*Choisir une condition*/
        var Condition = sessionConds[SessionNum][TrialNum];
        // console.log('n session:'+ SessionNum);
        // console.log('n trial:'+ TrialNum);
        // console.log('n condition:'+ Condition);

        var option1_image_idx = contexts[Condition][0];
        var option2_image_idx = contexts[Condition][1];

        var Option1 = images[option1_image_idx];
        Option1.id = "Option1";
        Option1 = Option1.outerHTML;

        var Option2 = images[option2_image_idx];
        Option2.id = "Option2";
        Option2 = Option2.outerHTML;

        var FB1 = feedbackImg["empty"];
        FB1.id = "FB1";
        FB1 = FB1.outerHTML;

        var FB2 = feedbackImg["empty"];
        FB2.id = "FB2";
        FB2 = FB2.outerHTML;

        if (language == 'en') {
            //var Title = '<div id = "Title"><H2 align = "center">Click on the slot machine of your choice<br><br><br><br></H2></div>';
            var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';
        } else if (language == 'fr') {
            var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';
        }

        var Count = '<div id = "Count"><H3 align = "center">Your current amount: ' + parseInt(sumReward) + ' points<br><br><br><br></H3><div>';

        /* Create canevas for the slot machine effect, of the size of the images */

        var canvas1 = '<canvas id="canvas1" height="620" width="620" class="img-responsive center-block" style="border: 5px solid transparent; position: relative; top: 0px;">';
        var canvas2 = '<canvas id="canvas2" height="620" width="620" class="img-responsive center-block" style="border: 5px solid transparent; position: relative; top: 0px;">';

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + Option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + Option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + FB1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + FB2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var InvertedPosition = +(Math.random() < 0.5);
        var Symbols = [option1_image_idx, option2_image_idx];

        if (InvertedPosition) {

            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + Option2 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + Option1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + FB2 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + FB1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div><div class="col-xs-1 col-md-1"></div></div>';

            var Symbols = [option2_image_idx, option1_image_idx];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

        var Choice_time = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !InvertedPosition) || (key === 112 && InvertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = Reward(1);
                color = getColor(fb);
                document.getElementById("Option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key == 112 && !InvertedPosition) || (key == 101 && InvertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = Reward(2);
                color = getColor(fb);
                document.getElementById("Option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = Reward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = Reward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });


        function Reward(Choice) {

            var Reaction_time = (new Date()).getTime();

            // choice is left
            var left_right = -1;

            if ((InvertedPosition && (Choice == 1)) || (!InvertedPosition && (Choice == 2))) {
                // choice is right
                left_right = 1;
            }

            var P1 = conditions[Condition]['prob'][0][1];
            var P2 = conditions[Condition]['prob'][1][1];
            var Mag1 = conditions[Condition]['reward'][0];
            var Mag2 = conditions[Condition]['reward'][1];

            p1 = conditions[Condition]['prob'][0];
            p2 = conditions[Condition]['prob'][1];
            r1 = conditions[Condition]['reward'][0];
            r2 = conditions[Condition]['reward'][1];

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

            if (Choice === 1) { /*Option1*/
                ThisReward = Mag1[+(Math.random() < P1)];
                OtherReward = Mag2[+(Math.random() < P2)];
                correctChoice = +(ev1 > ev2);
            } else { /*Option2*/
                OtherReward = Mag1[+(Math.random() < P1)];
                ThisReward = Mag2[+(Math.random() < P2)];
                correctChoice = +(ev2 > ev1);
            }

            sumReward += ThisReward;

            var fb1 = document.getElementById("FB1");
            var fb2 = document.getElementById("FB2");

            var pic1 = document.getElementById("Option1");
            var pic2 = document.getElementById("Option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            /*if(Info===1)
				feebackDuration = feebackDuration+500;*/

            if (Choice == 1) {
                fb1.src = feedbackImg['' + ThisReward].src;
                setTimeout(function () {

                    slideCard(pic1, cv1);

                    // if (Info === 1) {
                    //     fb2.src = feedbackImg['cf_' + OtherReward].src;
                    //     slideCard(pic2, cv2);
                    // }

                }, 500)

            } else {

                fb2.src = feedbackImg['' + ThisReward].src;
                setTimeout(function () {

                    slideCard(pic2, cv2);

                    // if (Info === 1) {
                    //     fb1.src = feedbackImg['cf_' + OtherReward].src;
                    //     slideCard(pic1, cv1);
                    // }

                }, 500)

            }

            if (offline === 0) SendLearnDataDB(0);

            Next();

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

            function SendLearnDataDB(call) {

                var wtest = 1; /* learning test */

                // clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ TEST: ' + wtest + ' $ TRIAL: ' + TrialNum + ' $ COND: ' + Condition
                //     + ' $ SYML: ' + Symbols[0] + ' $ SYMR: ' + Symbols[1] + ' $ CLR: ' + left_right + ' $ CGB: ' + ((Choice == 1) ? 1 : 0) + ' $ RGB: ' + 0 +
                //     ' $ CFGB: ' + 0 + ' $ RTIME: ' + (Reaction_time - Choice_time) + '$ REW: ' + parseInt(sumReward) / 1000 +
                //     ' $ SESSION: ' + SessionNum + ' $ P1: ' + P1 + ' $ P2: ' + P2 + ' $ MAG1: ' + Mag1 + ' $ MAG2: ' + Mag2 + ' $ VAL: ' + 0
                //     + ' $ INF: ' + 0 + ' $ OP1: ' + option1_image_idx + ' $ OP2: ' + option2_image_idx + ' $ V1: ' + 0 + ' $ V2: ' + 0 + ' $ INV: ' + InvertedPosition
                //     + ' $ CTIME: ' + (Choice_time - initTime);
                /*console.log(clog)*/

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        trial: TrialNum,
                        condition: Condition,
                        symL: Symbols[0],
                        symR: Symbols[1],
                        choice: Choice,
                        correct_choice: correctChoice,
                        outcome: ThisReward,
                        cf_outcome: OtherReward,
                        choice_left_right: left_right,
                        reaction_time: Reaction_time - Choice_time,
                        reward: sumReward,
                        session: SessionNum,
                        p1: P1,
                        p2: P2,
                        option1: option1_image_idx,
                        option2: option2_image_idx,
                        inverted: InvertedPosition,
                        choice_time: Choice_time - initTime
                    },
                    async: true,
                    url: 'InsertLearningDataDB.php',
                    /*dataType: 'json',*/
                    success: function (r) {
                        clog = 'learning_data $ ' + clog + ' $ dbcall success \n';
                        log += clog;

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            SendLearnDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        clog = 'learning_data $ ' + clog + ' $ dbcall failure \n';
                        log += clog;

                        if (call + 1 < maxDBCalls) {
                            SendLearnDataDB(call + 1);
                        }
                    }
                });
            };

            return ThisReward;
        };  /* function Reward(Choice) */


        function Next() {
            TrialNum++;
            if (TrialNum < nTrialsPerSession) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        PlayOptions(SessionNum, TrialNum);
                    }, 500);
                }, feebackDuration);

            } else {
                TrialNum = 0;
                SessionNum++;
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        NextSession(SessionNum, TrialNum);
                    }, 500);
                }, feebackDuration);
            }
        } /* function Next() */
    };  /* function PlayOptions(SessionNum,TrialNum) */

    function NextSession(SessionNum, TrialNum) {
        // InsertLog(0,'learn');
        console.log('Next Session');
        if (SessionNum < nSessions) {
            console.log('Continue Session');
            EndSession(SessionNum, TrialNum);
        } else {
            if (questionnaire) {
                console.log('Lotteries!!!');
                StartLotteries(1);
                //StartQuestionnaire();
            } else {
                EndExperiment();
            }
        }
    } /* function NextSession(SessionNum) */

    function EndSession(SessionNum, TrialNum) {

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">SESSION</H2>';

        var toprint = sumReward;

        var wonlost;
        var Info;
        var nextBut;

        if (language == 'en') {
            wonlost = ' earned ';
            if (toprint < 0) {
                wonlost = ' lost ';
            }
            Info = '<H3 align = "center">So far, you have ' + wonlost + toprint + ' points = ' + toprint * 0.03  + ' pence!<br><br>';
            nextBut = '"Next"';
        } else if (language == 'fr') {
            wonlost = ' gagné ';
            if (toprint < 0) {
                wonlost = ' perdu ';
            }

            Info = '<H3 align = "center">Jusqu\'ici vous avez' + wonlost + toprint + ' points = ' + toprint * 0.03 + ' centimes !<br>Encore 5 minutes d\'effort et vous aurez terminé !</h3><br><br>';

            nextBut = '"Suivant"';
        }

        totalReward = totalReward + sumReward;
        sumReward = 0;

        $('#TextBoxDiv').html(Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Next" value=' + nextBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Next').click(function () {
            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            PlaySessions(SessionNum, TrialNum);

        })
    } /* function EndSession(SessionNum) */

    function StartLotteries(PageNum) { /*text to uncomment for information*/

        var NumPages = 2;
        var toprint = sumReward;

        CreateDiv('Stage', 'TextBoxDiv');
        console.log('Starting Lotteries');

        if (language == 'en') {
            var Title = '<H3 align = "center">PHASE 2</H3>';
        } else if (language == 'fr') {
            var Title = '<H3 align = "center">PARTIE 2</H3>';
        }

        switch (PageNum) {

            case 1:
                if (language == 'en') {
                    wonlost = ' earned ';
                    if (toprint < 0) {
                        wonlost = ' lost ';
                    }
                    var Info = '<H3 align="center"><br>You finished the first phase of the cognitive experiment.<br> So far you have ' + wonlost + toprint + ' points = ' + toprint * 0.03 + ' pence!<br></h3><br><br>';
                } else if (language == 'fr') {
                    wonlost = ' gagné ';
                    if (toprint < 0) {
                        wonlost = ' perdu ';
                    }
                    var Info = '<H3 align="center"><br>Vous avez fini la première partie de l\'expérience cognitive.<br> Vous avez' + wonlost + toprint + ' points = ' + toprint * 0.03 + ' centimes !<br></h3><br><br>';
                }
                break;

            case 2:
                if (language == 'en') {
                    var Info = '<H3 align="center">You will now start the second phase of the task.<br><br>' +
                        'You will be choosing between pictures you have seen in the first phase of the experiment.<br><br>' +
                        //'The pictures keep the same value as in the previous first phase, meaning that they give (on average) the same amount of points.<br><br>' +
                        'The only difference is that the pictures are now presented with their respective probability of winning or losing.<br><br>' +
                        'Click when you are ready</h3>';
                } else if (language == 'fr') {
                    var Info = '<H3 align="center">Vous allez maintenant commencer la deuxième partie de l\'expérience.<br><br>' +
                        'Vous allez choisir entre les images que vous avez vues dans la première partie de l\'expérience.<br><br>' +
                        //'Les images gardent les mêmes valeurs que précédemment, ce qui veut dire qu\'elles rapportent (en moyenne) le même nombre de points.<br><br>' +
                        'La seule différence est que les images sont maintenant présentées avec leurs probabilités de gains et pertes.<br><br>' +
                        'Cliquez lorsque vous êtes prêts.</h3>';
                }
                break;

            default:
                var Info;
                break;
        }

        $('#TextBoxDiv').html(Title + Info);

        if (language == 'en') {
            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Start" value="Start!" ></div>';
        } else if (language == 'fr') {
            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Précédent" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Next" value="Suivant" >\n\
			<input align="center" type="button"  class="btn btn-default" id="Start" value="Commencer !" ></div>';
        }

        $('#Bottom').html(Buttons);

        if (PageNum === 1) {
            $('#Back').hide();
        }
        ;

        if (PageNum === NumPages) {
            $('#Next').hide();
        }
        ;

        if (PageNum < NumPages) {
            $('#Start').hide();
        }
        ;

        $('#Back').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            StartLotteries(PageNum - 1);
        });

        $('#Next').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            StartLotteries(PageNum + 1);

        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (language == 'en') {
                setTimeout(function () {
                    $('#Stage').html('<H1 align = "center">Ready...</H1>');
                    setTimeout(function () {
                        $('#Stage').html('<H1 align = "center">Steady...</H1>');
                        setTimeout(function () {
                            $('#Stage').html('<H1 align = "center">Go!</H1>');
                            setTimeout(function () {
                                $('#Stage').empty();
                                PlayLotteries(0);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 10);
            } else if (language == 'fr') {
                setTimeout(function () {
                    $('#Stage').html('<H1 align = "center">A vos marques...</H1>');
                    setTimeout(function () {
                        $('#Stage').html('<H1 align = "center">Prêt ?</H1>');
                        setTimeout(function () {
                            $('#Stage').html('<H1 align = "center">Partez !</H1>');
                            setTimeout(function () {
                                $('#Stage').empty();
                                PlayLotteries(0);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 10);
            }
        });
    };  /* function StartPostLearning(PageNum) */
    function PlayLotteries(TrialNum) {

        if ($('#TextBoxDiv').length === 0) {
            CreateDiv('Stage', 'TextBoxDiv');
            /*document.getElementById("TextBoxDiv").style.backgroundColor = "white";*/
        }

        /*Choisir une condition*/
        var Condition = lotteriesConds[TrialNum];
        // console.log('n session:'+ SessionNum);
        // console.log('n trial:'+ TrialNum);
        // console.log('n condition:'+ Condition);

        var option1_image_idx = contexts[Condition][0];
        var option2_image_idx = contexts[Condition][1];

        var Option1 = images[option1_image_idx];
        Option1.id = "Option1";
        Option1 = Option1.outerHTML;

        var Option2 = images[option2_image_idx];
        Option2.id = "Option2";
        Option2 = Option2.outerHTML;

        var FB1 = feedbackImg["empty"];
        FB1.id = "FB1";
        FB1 = FB1.outerHTML;

        var FB2 = feedbackImg["empty"];
        FB2.id = "FB2";
        FB2 = FB2.outerHTML;

        if (language == 'en') {
            //var Title = '<div id = "Title"><H2 align = "center">Click on the slot machine of your choice<br><br><br><br></H2></div>';
            var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';
        } else if (language == 'fr') {
            var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';
        }

        var Count = '<div id = "Count"><H3 align = "center">Your current amount: ' + parseInt(sumReward) + ' points<br><br><br><br></H3><div>';

        /* Create canevas for the slot machine effect, of the size of the images */

        var canvas1 = '<canvas id="canvas1" height="620" width="620" class="img-responsive center-block" style="border: 5px solid transparent; position: relative; top: 0px;">';
        var canvas2 = '<canvas id="canvas2" height="620" width="620" class="img-responsive center-block" style="border: 5px solid transparent; position: relative; top: 0px;">';

        var P1W = conditions[Condition]['prob'][0][1];
        var P1L = conditions[Condition]['prob'][0][0];
        var P2W = conditions[Condition]['prob'][1][1];
        var P2L = conditions[Condition]['prob'][1][0];
        var M1W = conditions[Condition]['reward'][0][1];
        var M1L = conditions[Condition]['reward'][0][0];
        var M2W = conditions[Condition]['reward'][1][1];
        var M2L = conditions[Condition]['reward'][1][0];

        if (sum([P1L, P1W]) === 2) {
            var valW = ['winning', 'losing'][+(M1W < 0)];
            var textProb1 = '<p style="font-size: 18px;"> <b>' + P1W * 100 + '%</b> chance of ' + valW + ' <b>' + M1W + '</b></p>';
        } else {
            var valW = ['winning', 'losing'][+(M1W < 0)];
            var valL = ['winning', 'losing'][+(M1L < 0)];
            var textProb1 = '<p style="font-size: 18px;"> <b>' + P1W * 100 + '%</b> chance of ' + valW + ' <b>' + M1W + '</b> <br>'
                + '<b>' + P1L * 100 + '%</b> chance of ' + valL + ' <b>' + M1L + '</b> </p>';
        }
        if (sum([P2L, P2W]) === 2) {
            var valW = ['winning', 'losing'][+(M2W < 0)];
            var textProb2 = '<p style="font-size: 18px;"> <b>' + P2W * 100 + '%</b> chance of ' + valW + ' <b>' + M2W + '</b></p>';
        } else {
            var valW = ['winning', 'losing'][+(M2W < 0)];
            var valL = ['winning', 'losing'][+(M2L < 0)];
            var textProb2 = '<p style="font-size: 18px;"> <b>' + P2W * 100 + '%</b> chance of ' + valW + ' <b>' + M2W + '</b> <br>'
                + '<b>' + P2L * 100 + '%</b> chance of ' + valL + ' <b>' + M2L + '</b> </p>';
        }

        var probabilityRow = '<div class="row" style="transform: translate(0%, -800%);position:relative;"><div class="col-xs-1 col-md-1"></div>' +
            '<div class="col-xs3 col-md-3" style="text-align: center;">' + textProb1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3" style="text-align: center;">' + textProb2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> <div class="col-xs-1 col-md-1"></div><div class="col-xs-3 col-md-3">' +
            Option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + Option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + FB1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + FB2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var InvertedPosition = +(Math.random() < 0.5);
        var Symbols = [option1_image_idx, option2_image_idx];

        if (InvertedPosition) {

            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + Option2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3" >' + Option1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';
            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + FB2 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + FB1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div><div class="col-xs-1 col-md-1"></div></div>';

            var probabilityRow = '<div class="row" style="transform: translate(0%, -800%);position:relative;"><div class="col-xs-1 col-md-1"></div>' +
            '<div class="col-xs3 col-md-3" style="text-align: center;">' + textProb2 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3" style="text-align: center;">' + textProb1 + '</div><div class="col-xs-1 col-md-1"></div></div>';

            var Symbols = [option2_image_idx, option1_image_idx];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas + probabilityRow);

        var Choice_time = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !InvertedPosition) || (key === 112 && InvertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = Reward(1);
                color = getColor(fb);
                document.getElementById("Option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key === 112 && !InvertedPosition) || (key === 101 && InvertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = Reward(2);
                color = getColor(fb);
                document.getElementById("Option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = Reward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = Reward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });


        function Reward(Choice) {

            var Reaction_time = (new Date()).getTime();

            // choice is left
            var left_right = -1;

            if ((InvertedPosition && (Choice === 1)) || (!InvertedPosition && (Choice === 2))) {
                // choice is right
                left_right = 1;
            }

            var P1 = conditions[Condition]['prob'][0][1];
            var P2 = conditions[Condition]['prob'][1][1];
            var Mag1 = conditions[Condition]['reward'][0];
            var Mag2 = conditions[Condition]['reward'][1];

            p1 = conditions[Condition]['prob'][0];
            p2 = conditions[Condition]['prob'][1];
            r1 = conditions[Condition]['reward'][0];
            r2 = conditions[Condition]['reward'][1];

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

            console.log('choice: ' + Choice);
            console.log('left_right: ' + left_right);
            console.log('EV1: ' + ev1);
            console.log('EV2: ' + ev2);

            if (Choice === 1) { /*Option1*/
                ThisReward = Mag1[+(Math.random() < P1)];
                OtherReward = Mag2[+(Math.random() < P2)];
                correctChoice = +(ev1 > ev2);
            } else { /*Option2*/
                OtherReward = Mag1[+(Math.random() < P1)];
                ThisReward = Mag2[+(Math.random() < P2)];
                correctChoice = +(ev2 > ev1);
            }

            console.log('CorrectChoice: ' + correctChoice);

            sumReward += ThisReward;

            var fb1 = document.getElementById("FB1");
            var fb2 = document.getElementById("FB2");

            var pic1 = document.getElementById("Option1");
            var pic2 = document.getElementById("Option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            /*if(Info===1)
				feebackDuration = feebackDuration+500;*/

            if (Choice == 1) {
                fb1.src = feedbackImg['' + ThisReward].src;
                setTimeout(function () {

                    slideCard(pic1, cv1);

                    // if (Info === 1) {
                    //     fb2.src = feedbackImg['cf_' + OtherReward].src;
                    //     slideCard(pic2, cv2);
                    // }

                }, 500)

            } else {

                fb2.src = feedbackImg['' + ThisReward].src;
                setTimeout(function () {

                    slideCard(pic2, cv2);

                    // if (Info === 1) {
                    //     fb1.src = feedbackImg['cf_' + OtherReward].src;
                    //     slideCard(pic1, cv1);
                    // }

                }, 500)

            }

            if (offline === 0) SendLotteriesDataDB(0);

            Next();

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

            function SendLotteriesDataDB(call) {

                var wtest = 1; /* learning test */

                // clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ TEST: ' + wtest + ' $ TRIAL: ' + TrialNum + ' $ COND: ' + Condition
                //     + ' $ SYML: ' + Symbols[0] + ' $ SYMR: ' + Symbols[1] + ' $ CLR: ' + left_right + ' $ CGB: ' + ((Choice == 1) ? 1 : 0) + ' $ RGB: ' + 0 +
                //     ' $ CFGB: ' + 0 + ' $ RTIME: ' + (Reaction_time - Choice_time) + '$ REW: ' + parseInt(sumReward) / 1000 +
                //     ' $ SESSION: ' + SessionNum + ' $ P1: ' + P1 + ' $ P2: ' + P2 + ' $ MAG1: ' + Mag1 + ' $ MAG2: ' + Mag2 + ' $ VAL: ' + 0
                //     + ' $ INF: ' + 0 + ' $ OP1: ' + option1_image_idx + ' $ OP2: ' + option2_image_idx + ' $ V1: ' + 0 + ' $ V2: ' + 0 + ' $ INV: ' + InvertedPosition
                //     + ' $ CTIME: ' + (Choice_time - initTime);
                /*console.log(clog)*/

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        trial: TrialNum,
                        condition: Condition,
                        symL: Symbols[0],
                        symR: Symbols[1],
                        choice: Choice,
                        correct_choice: correctChoice,
                        outcome: ThisReward,
                        cf_outcome: OtherReward,
                        choice_left_right: left_right,
                        reaction_time: Reaction_time - Choice_time,
                        reward: sumReward,
                        session: -2,
                        p1: P1,
                        p2: P2,
                        option1: option1_image_idx,
                        option2: option2_image_idx,
                        inverted: InvertedPosition,
                        choice_time: Choice_time - initTime
                    },
                    async: true,
                    url: 'InsertLearningDataDB.php',
                    /*dataType: 'json',*/
                    success: function (r) {
                        clog = 'learning_data $ ' + clog + ' $ dbcall success \n';
                        log += clog;

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            SendLotteriesDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        clog = 'learning_data $ ' + clog + ' $ dbcall failure \n';
                        log += clog;

                        if (call + 1 < maxDBCalls) {
                            SendLotteriesDataDB(call + 1);
                        }
                    }
                });
            };

            return ThisReward;
        };  /* function Reward(Choice) */


        function Next() {
            TrialNum++;
            if (TrialNum < nTrialsLotteries) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        PlayLotteries(TrialNum);
                    }, 500);
                }, feebackDuration);

            } else {
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        StartReasoningTest();
                    }, 500);
                }, feebackDuration);
            }
        } /* function Next() */
    };  /* function PlayOptions(SessionNum,TrialNum) */

    function StartReasoningTest() {

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">QUESTIONNAIRE</H3>';

        var startBut;

        if (language == 'en') {

            startBut = '"Start"'
            var Info = '<H3 align = "center">You are now about to start the third phase.<br>' +
                'You will see several items that vary in difficulty. Please answer as many as you can.</H3><br><br>';

        } else if (language == 'fr') {

            startBut = '"Commencer !"'
            var Info = '<H3 align = "center">Vous aller maintenant commencer la troisième partie.<br>' +
                'Il vous faut répondre à plusieurs questions dont la difficulté varie.</H3><br><br>';

        }

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            PlayQuestionnaire_CRT(1);
        });
    };  /* function StartQuestionnaire() */

    function PlayQuestionnaire_CRT(QuestNum) {

        var NumQuestions = 7; /*mettre a jour le nombre de pages (questions) via le script*/

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 7;

        if (language == 'en') {

            switch (QuestNum) {

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

            var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

        } else if (language == 'fr') {

            switch (QuestNum) {

                case 1:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Une batte et une balle de baseball coûtent un total de 1,10€. La batte seule coûte 1.00€ de plus que la balle. Combien coûte la balle ?' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var contents = new Array();
                    contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 5 centimes </label><br>';
                    contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 10 centimes </label><br>';
                    contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 9 centimes </label><br>';
                    contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 1 centime </label><br>';
                    contents = shuffle(contents);
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "CRT-7";
                    itemNum = 1;

                    break;

                case 2:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Dans une usine, cinq machines produisent 5 objets en 5 minutes. Combien faut-il de temps à 100 machines pour produire 100 objets ?' +
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
                        'Sur un lac, il y a un carré de nénuphars. Chaque jour, le carré double en surface. Sachant qu\'il faut 48 jours pour que les nénuphars couvrent la totalité du lac, combien de jours leur faut-il pour en couvrir la moitié ?' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var contents = new Array();
                    contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 47 jours </label><br>';
                    contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 24 jours </label><br>';
                    contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 12 jours </label><br>';
                    contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 36 jours </label><br>';
                    contents = shuffle(contents);
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "CRT-7";
                    itemNum = 3;

                    break;

                case 4:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Sachant que Jean peut boire un baril d\'eau en 6 jours, et que Marie peut boire un baril d\'eau en 12 jours, combien de temps leur faudra-t-il pour boire un baril d\'eau ensemble ?' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var contents = new Array();
                    contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 4 jours </label><br>';
                    contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 9 jours </label><br>';
                    contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 12 jours </label><br>';
                    contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 3 jours </label><br>';
                    contents = shuffle(contents);
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "CRT-7";
                    itemNum = 4;

                    break;

                case 5:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'La note de Jérémie est à la fois la 15ème plus haute et la 15ème plus basse de sa classe. Combien y a-t-il d\'élèves dans la classe ?' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var contents = new Array();
                    contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 29 élèves </label><br>';
                    contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 30 élèves </label><br>';
                    contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 1 élève </label><br>';
                    contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 15 élèves </label><br>';
                    contents = shuffle(contents);
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "CRT-7";
                    itemNum = 5;

                    break;

                case 6:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Un homme achète un cochon pour 60€, le vend pour 70€, le rachète pour 80€, et le revend finalement pour 90€. Combien d\'argent a-t-il gagné ?' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var contents = new Array();
                    contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 20 euros </label><br>';
                    contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 10 euros </label><br>';
                    contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 0 euros </label><br>';
                    contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 30 euros </label><br>';
                    contents = shuffle(contents);
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "CRT-7";
                    itemNum = 6;

                    break;

                case 7:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Simon a décidé d\'investir 8 000€ en bourse au début de l\'année 2008. Six mois après son investissement, le 17 juillet, les actions qu\'il a achetées ont perdu 50% de leur valeur. ' +
                        'Heureusement pour Simon, du 17 juillet au 17 octobre, les actions qu\'il a achetées ont ensuite augmenté de 75% de leur valeur. A ce moment, Simon :' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var contents = new Array();
                    contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> a perdu de l\'argent. </label><br>';
                    contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> est plus riche que lorsqu\'il a commencé. </label><br>';
                    contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> a équilibré son budget en bourse. </label><br>';
                    contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> ça ne peut pas être déterminé. </label><br>';
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

            var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Suivant" > </div><div class="col-xs-1 col-md-1"></div></div>';

        }
        ;

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

                if (offline == 0) SendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    QuestNum += nb_skip + 1;
                } else {
                    QuestNum++;
                }

                if (QuestNum <= NumQuestions) {
                    PlayQuestionnaire_CRT(QuestNum);
                } else {
                    StartQuestionnaire();
                }
            }
            ;
        });

        function SendQuestDataDB(call) {
            clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ QUESTIONNAIRE: ' + questID + ' $ NUMBER: ' + 1 + ' $ ITEM: ' + itemNum + ' $ ANSWER: ' + answer + ' $ VAL:' + answer_value + ' $ RTIME: ' + (Reaction_time - Question_time);
            /*console.log(clog)*/

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
                url: 'InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall success \n';
                    log += clog;

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall failure \n';
                    log += clog;

                    if (call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                }
            });
        };  /* function SendQuestDataDB(call) */
    }; /* function PlayQuestionnaire_CRT(QuestNum) */

    function StartQuestionnaire() {

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">QUESTIONNAIRE</H3>';

        var startBut;
        if (language == 'en') {
            startBut = '"Start"'
            var Info = '<H3 align = "center">You will now have to answer a few questions.<br><br>This won\'t take more than a few more minutes.<br><br>Your answers remain anonymous and will not be disclosed.<br><br>' +
                'Note that the experiment will be considered completed (and the payment issued) only if the questionnaires are correctly filled.<br><br>' +
                'Please click "Start" when you are ready.</H3><br><br>';
        } else if (language == 'fr') {
            startBut = '"Commencer"'
            var Info = '<H3 align = "center">Maintenant, nous allons vous poser quelques questions.<br><br>Nous vous prions d\'y répondre le plus précisément possible.<br><br>Nous vous rappelons que les réponses sont anonymes et ne seront pas divulguées.<br><br>' +
                'Attention : l\'expérience ne sera complète que si les questionnaires sont correctement remplis.<br><br>' +
                'Cliquez sur Commencer dès que vous êtes prêt.</H3><br><br>';
        }

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            PlayQuestionnaire_SES(1);
        });
    };  /* function StartQuestionnaire() */

    function PlayQuestionnaire_FTND(QuestNum) {

        var NumQuestions = 6; /*mettre a jour le nombre de pages (questions) via le script*/

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 6;

        switch (QuestNum) {

            case 1:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Do you smoke cigarettes on a daily basis?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1"  name= "answer" value= 1>  <label for="1"> Yes </label><br>' +
                    '<input type= "radio" id="-1" name= "answer" value= -1> <label for="-1"> No </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "FTND-6_instruction";
                itemNum = 1;

                break;

            case 2:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'How soon after waking do you smoke your first cigarette?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Within 05 minutes </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 05-30 minutes </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 31-60 minutes </label><br>' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Later than 60 minutes </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "FTND-6";
                itemNum = 1;

                break;

            case 3:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Do you find it difficult to refrain from smoking in places where it is forbidden (Church, Library, etc)?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Yes </label><br>' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> No  </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "FTND-6";
                itemNum = 2;

                break;

            case 4:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Which cigarette would you hate to give up?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> The first in the morning </label><br>' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Any other </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "FTND-6";
                itemNum = 3;

                break;

            case 5:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'How many cigarettes a day do you smoke?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 10 or less </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 11-20 </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 21-30 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 31 or more  </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "FTND-6";
                itemNum = 4;

                break;

            case 6:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Do you smoke more frequently in the morning?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Yes </label><br>' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> No  </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "FTND-6";
                itemNum = 5;

                break;

            case 7:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Do you smoke even if you are sick in bed most of the day?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Yes </label><br>' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> No  </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "FTND-6";
                itemNum = 6;

                break;
            default:

                break;

        }
        ;

        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {
                alert('Please select one answer.');

            } else {

                Reaction_time = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('id')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                if (offline == 0) SendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    QuestNum += nb_skip + 1;
                } else {
                    QuestNum++;
                }

                if (QuestNum <= NumQuestions + 1) {
                    PlayQuestionnaire_FTND(QuestNum);
                } else {
                    PlayQuestionnaire_AUDIT(1);
                }
            }
            ;
        });

        function SendQuestDataDB(call) {
            clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ QUESTIONNAIRE: ' + questID + ' $ NUMBER: ' + 2 + ' $ ITEM: ' + itemNum + ' $ ANSWER: ' + answer + ' $ VAL:' + answer_value + ' $ RTIME: ' + (Reaction_time - Question_time);
            /*console.log(clog)*/

            $.ajax({
                type: 'POST',
                data: {
                    exp: expName,
                    expID: expID,
                    id: subID,
                    qid: questID,
                    qnum: 2,
                    item: itemNum,
                    ans: answer,
                    val: answer_value,
                    reaction_time: Reaction_time - Question_time
                },
                async: true,
                url: 'InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall success \n';
                    log += clog;

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall failure \n';
                    log += clog;

                    if (call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                }
            });
        };  /* function SendQuestDataDB(call) */
    }; /* function PlayQuestionnaire_FTND(QuestNum) */

    function PlayQuestionnaire_AUDIT(QuestNum) {

        var NumQuestions = 10; /*mettre a jour le nombre de pages (questions) via le script*/

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 10;

        switch (QuestNum) {

            case 1:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Do you ever have a drink containing alcohol?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1"  name= "answer" value= 1>  <label for="1"> Yes </label><br>' +
                    '<input type= "radio" id="-1" name= "answer" value= -1> <label for="-1"> No </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10_instruction";
                itemNum = 1;

                break;

            case 2:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'How often do you have a drink containing alcohol?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Monthly or less </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2-4 times a month </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 2-3 times a week </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 or more times a week </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 1;

                break;

            case 3:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'How many standard drinks containing alcohol do you have on a typical day when drinking?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Not concerned </label><br>' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 1 or 2 </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 3 or 4 </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 5 or 6 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 7 or 9 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 10 or more </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 2;

                break;

            case 4:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'How often do you have six or more drinks on one occasion?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Less than monthly </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Monthly </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Weekly </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Daily or almost daily </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 3;

                break;

            case 5:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'During the past year, how often have you found that you were not able to stop drinking once you had started?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Less than monthly </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Monthly </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Weekly </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Daily or almost daily </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 4;

                break;

            case 6:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'During the past year, how often have you failed to do what was normally expected of you because of drinking?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Less than monthly </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Monthly </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Weekly </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Daily or almost daily </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 5;

                break;

            case 7:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'During the past year, how often have you needed a drink in the morning to get yourself going after a heavy drinking session?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Less than monthly </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Monthly </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Weekly </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Daily or almost daily </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 6;

                break;

            case 8:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'During the past year, how often have you had a feeling of guilt or remorse after drinking?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Less than monthly </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Monthly </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Weekly </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Daily or almost daily </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 7;

                break;

            case 9:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'During the past year, have you been unable to remember what happened the night before because you had been drinking?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Less than monthly </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Monthly </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Weekly </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Daily or almost daily </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 8;

                break;

            case 10:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Have you or someone else been injured as a result of your drinking?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> No </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Yes, but not in the past year </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Yes, during the past year  </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 9;

                break;

            case 11:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Has a relative or friend, doctor or other health worker been concerned about your drinking or suggested you cut down?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> No </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> Yes, but not in the past year </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Yes, during the past year  </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "AUDIT-10";
                itemNum = 10;

                break;
            default:

                break;

        }
        ;

        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {
                alert('Please select one answer.');

            } else {

                Reaction_time = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('id')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                if (offline == 0) SendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    QuestNum += nb_skip + 1;
                } else {
                    QuestNum++;
                }

                if (QuestNum <= NumQuestions + 1) {
                    PlayQuestionnaire_AUDIT(QuestNum);
                } else {
                    PlayQuestionnaire_CAST(1);
                }
            }
            ;
        });

        function SendQuestDataDB(call) {
            clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ QUESTIONNAIRE: ' + questID + ' $ NUMBER: ' + 3 + ' $ ITEM: ' + itemNum + ' $ ANSWER: ' + answer + ' $ VAL:' + answer_value + ' $ RTIME: ' + (Reaction_time - Question_time);
            /*console.log(clog)*/

            $.ajax({
                type: 'POST',
                data: {
                    exp: expName,
                    expID: expID,
                    id: subID,
                    qid: questID,
                    qnum: 3,
                    item: itemNum,
                    ans: answer,
                    val: answer_value,
                    reaction_time: Reaction_time - Question_time
                },
                async: true,
                url: 'InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall success \n';
                    log += clog;

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall failure \n';
                    log += clog;

                    if (call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                }
            });
        };  /* function SendQuestDataDB(call) */
    }; /* function PlayQuestionnaire_AUDIT(QuestNum) */

    function PlayQuestionnaire_CAST(QuestNum) {

        var NumQuestions = 6; /*mettre a jour le nombre de pages (questions) via le script*/

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 6;

        switch (QuestNum) {

            case 1:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In the last 12 months, have you smoked cannabis?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1"  name= "answer" value= 1>  <label for="1"> Yes </label><br>' +
                    '<input type= "radio" id="-1" name= "answer" value= -1> <label for="-1"> No </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CAST-6_instruction";
                itemNum = 1;

                break;

            case 2:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In the last 12 months, have you smoked cannabis before midday?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Rarely </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> From time to time </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Fairly often </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Very often </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CAST-6";
                itemNum = 1;

                break;

            case 3:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In the last 12 months, have you smoked cannabis when you were alone?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Rarely </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> From time to time </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Fairly often </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Very often </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CAST-6";
                itemNum = 2;

                break;

            case 4:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In the last 12 months, have you had memory problems when you smoked cannabis?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Rarely </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> From time to time </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Fairly often </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Very often </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CAST-6";
                itemNum = 3;

                break;

            case 5:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In the last 12 months, have friends or members of your family told you that you ought to reduce your cannabis use?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Rarely </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> From time to time </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Fairly often </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Very often </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CAST-6";
                itemNum = 4;

                break;

            case 6:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In the last 12 months, have you tried to reduce or stop your cannabis use without succeeding?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Rarely </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> From time to time </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Fairly often </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Very often </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CAST-6";
                itemNum = 5;

                break;

            case 7:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In the last 12 months, have you had problems because of your use of cannabis (argument, fight, accident, bad result at school, etc)?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> Never </label><br>' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> Rarely </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> From time to time </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> Fairly often </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> Very often </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CAST-6";
                itemNum = 6;

                break;
            default:

                break;

        }
        ;

        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {
                alert('Please select one answer.');

            } else {

                Reaction_time = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('id')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                if (offline == 0) SendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    QuestNum += nb_skip + 1;
                } else {
                    QuestNum++;
                }

                if (QuestNum <= NumQuestions + 1) {
                    PlayQuestionnaire_CAST(QuestNum);
                } else {
                    PlayQuestionnaire_SES(1);
                }
            }
            ;
        });

        function SendQuestDataDB(call) {
            clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ QUESTIONNAIRE: ' + questID + ' $ NUMBER: ' + 4 + ' $ ITEM: ' + itemNum + ' $ ANSWER: ' + answer + ' $ VAL:' + answer_value + ' $ RTIME: ' + (Reaction_time - Question_time);
            /*console.log(clog)*/

            $.ajax({
                type: 'POST',
                data: {
                    exp: expName,
                    expID: expID,
                    id: subID,
                    qid: questID,
                    qnum: 4,
                    item: itemNum,
                    ans: answer,
                    val: answer_value,
                    reaction_time: Reaction_time - Question_time
                },
                async: true,
                url: 'InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall success \n';
                    log += clog;

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall failure \n';
                    log += clog;

                    if (call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                }
            });
        };  /* function SendQuestDataDB(call) */
    }; /* function PlayQuestionnaire_CAST(QuestNum) */

    function PlayQuestionnaire_SES(QuestNum) {

        var NumQuestions = 13; /*mettre a jour le nombre de pages (questions) via le script*/

        CreateDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 0;

        if (language == 'en') {

            var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

            switch (QuestNum) {

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
                        'At the top of the ladder are the people who have the highest standing in their community. At the bottom are the people who have the lowest standing in their community.<br><br>' +
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
            ;
        } else if (language == 'fr') {

            var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Suivant" > </div><div class="col-xs-1 col-md-1"></div></div>';

            switch (QuestNum) {

                case 1:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Les questions suivantes mesurent votre perception de votre enfance et de votre vie en tant qu’adulte. Nous vous demandons de préciser à quel point vous êtes d’accord avec les phrases suivantes, sur une échelle allant de 1 (pas du tout d’accord) à 9 (tout à fait d’accord).' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> J\'ai compris </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13_instruction";
                    itemNum = 1;

                    break;

                case 2:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Lorsque j’étais enfant, quelqu’un à la maison était toujours en train de crier sur quelqu’un d’autre.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 1;

                    break;

                case 3:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Certaines punitions que j’ai reçues en étant enfant me semblent aujourd’hui très sévères.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 2;

                    break;

                case 4:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'J’imagine que je pourrais dire que je n’ai pas été traité aussi bien que j’aurais dû l’être à la maison.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 3;

                    break;

                case 5:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Avant mes 10 ans, la vie à la maison était souvent chaotique.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 4;

                    break;

                case 6:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Avant mes 10 ans, souvent je ne pouvais pas prévoir à l’avance les allées et venues des gens à la maison.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 5;

                    break;

                case 7:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Avant mes 10 ans, je trouvais très difficile de savoir ce que mes parents ou les autres personnes présentes dans ma maison allaient dire ou faire d’un jour à l’autre.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 6;

                    break;

                case 8:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Avant mes 10 ans, ma famille ne manquait généralement pas d’argent pour nos achats.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 7;

                    break;

                case 9:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Avant mes 10 ans, j’ai grandi dans un quartier plutôt aisé.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 8;

                    break;

                case 10:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Avant mes 10 ans, je me sentais plutôt riche par rapport aux autres enfants de mon école.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 9;

                    break;

                case 11:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Maintenant que je suis adulte, j’ai assez d’argent pour acheter ce que je veux.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 10;

                    break;

                case 12:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Maintenant que je suis adulte, je n’ai pas trop besoin de me soucier de payer mes factures.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 11;

                    break;

                case 13:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Maintenant que je suis adulte, je ne pense pas avoir à me soucier de l’argent dans le futur.' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Pas du tout d’accord </label><br>' +
                        '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Tout à fait d’accord </label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 12;

                    break;

                case 14:
                    var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                        'Considérez cette échelle comme une représentation du classement des gens dans leur communauté. ' +
                        'Les gens définissent « communauté » de différentes façons : définissez-la de la manière la plus pertinente pour vous.<br>' +
                        'En haut de l’échelle, on trouve les gens ayant le plus haut statut dans leur communauté. En bas de l’échelle, on trouve les gens ayant le plus bas statut dans leur communauté.<br><br>' +
                        'Où vous placeriez-vous sur cette échelle ?' +
                        '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                    var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                        '<input type= "radio" id="10" name= "answer" value= 10> <label for="10"> 10 Très haut statut</label><br>' +
                        '<input type= "radio" id="9"  name= "answer" value= 9>  <label for="9"> 9 </label><br>' +
                        '<input type= "radio" id="8"  name= "answer" value= 8>  <label for="8"> 8 </label><br>' +
                        '<input type= "radio" id="7"  name= "answer" value= 7>  <label for="7"> 7 </label><br>' +
                        '<input type= "radio" id="6"  name= "answer" value= 6>  <label for="6"> 6 </label><br>' +
                        '<input type= "radio" id="5"  name= "answer" value= 5>  <label for="5"> 5 </label><br>' +
                        '<input type= "radio" id="4"  name= "answer" value= 4>  <label for="4"> 4 </label><br>' +
                        '<input type= "radio" id="3"  name= "answer" value= 3>  <label for="3"> 3 </label><br>' +
                        '<input type= "radio" id="2"  name= "answer" value= 2>  <label for="2"> 2 </label><br>' +
                        '<input type= "radio" id="1"  name= "answer" value= 1>  <label for="1"> 1 Très bas statut</label><br><br><br><br>' +
                        '</div><div class="col-xs-1 col-md-1"></div></div>';
                    questID = "SES-13";
                    itemNum = 13;

                    break;
                default:

                    break;

            }
            ;
        }

        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {

                alert('Please select one answer.');

            } else {

                Reaction_time = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('id')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                if (offline == 0) SendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    QuestNum += nb_skip + 1;
                } else {
                    QuestNum++;
                }

                if (QuestNum <= NumQuestions + 1) {
                    PlayQuestionnaire_SES(QuestNum);
                } else {
                    EndExperiment();
                }
            }
            ;
        });

        function SendQuestDataDB(call) {
            clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ QUESTIONNAIRE: ' + questID + ' $ NUMBER: ' + 5 + ' $ ITEM: ' + itemNum + ' $ ANSWER: ' + answer + ' $ VAL:' + answer_value + ' $ RTIME: ' + (Reaction_time - Question_time);
            /*console.log(clog)*/

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
                    reaction_time: Reaction_time - Question_time
                },
                async: true,
                url: 'InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall success \n';
                    log += clog;

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall failure \n';
                    log += clog;

                    if (call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                }
            });
        };  /* function SendQuestDataDB(call) */
    }; /* function PlayQuestionnaire_SES(QuestNum) */

    function EndExperiment() {

        // InsertLog(0,'log');

        CreateDiv('Stage', 'TextBoxDiv');

        var toprint = totalReward;

        var wonlost;
        if (language == 'en') {
            wonlost = ' earned ';
            if (toprint < 0) {
                wonlost = ' lost ';
            }
        } else if (language == 'fr') {
            wonlost = ' gagné ';
            if (toprint < 0) {
                wonlost = ' perdu ';
            }
        }

        if (language == 'en') {
            var Title = '<h3 align = "center">The game is over!<br>' +
                'You ' + wonlost + toprint + ' points in total, which is ' + toprint * 0.03 + ' pence.<br><br>Thank you for playing!<br><br>Please click the link to complete this study:<br></h3><br>';
            var url = '';
            if (compLink)
                url = '<center><a href="' + link + '">Click here.</a></center>';
        } else if (language == 'fr') {
            var Title = '<h3 align = "center">L\'expérience est terminée !<br>' +
                'Vous avez ' + wonlost + toprint + ' points au total, ce qui correspond à ' + toprint / 2 + ' centimes.<br><br>Merci de votre participation !<br><br>Cliquez sur ce lien pour compléter l\'étude :<br></h3><br>';
            var url = '';
            if (compLink)
                url = '<center><a href="' + link + '">Cliquez ici.</a></center>';
        }

        $('#TextBoxDiv').html(Title + url);
    };  /* function EndExperiment() */

    function GetUserInfo() {

        CreateDiv('Stage', 'TextBoxDiv');
        var Title = '<H3 align = "center">Please indicate your</H3><br>';
        var Age = '<div align="center">Age: <input type="text" id = "age_id" name="age"><br></div>';
        var Gender = '<div align="center">Gender: <input type= "radio" id="m" name= "gender" >Male' + '<input type= "radio" id="f" name= "gender">Female<br></div>';

        $('#TextBoxDiv').html(Title + Age + '<br><br>' + Gender);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toQuestions" value="Next" ></div>';
        $('#Bottom').html(Buttons);

        $('#toQuestions').click(function () {
            age_val = parseInt(document.getElementById('age_id').value);

            if (($("input:radio:checked").length < 1) || isNaN(age_val) || (age_val < 0) || (age_val > 100)) {
                alert('Please fill the required fields.');
            } else {
                gender_val = $("input:radio:checked").attr('id');
                if (offline == 0) SendUserDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                PlayQuestionnaire(1);
            }
        });

        function SendUserDataDB() {
            $.ajax({
                type: 'POST',
                data: {id: subID, age: age_val, gender: gender_val},
                async: true,
                url: 'InsertSubDetails.php',
                /*dataType: 'json',*/
                success: function (r) {
                    if (r[0].ErrorNo > 0) {
                        /*subID = createCode();*/
                        /*RunExperiment(thisAge, thisEdu, thisSex);*/
                        /*DisplayError();*/
                    } else {
                        /*PlaySessions(0);*/
                    }
                    ;
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus);
                    alert("Error: " + errorThrown);
                }
            });
        } /* function SendUserDataDB() */
    } /* function GetUserInfo() */

    function getKeyCode(event) {

        return event.which;
    }  /* function getKeyCode(event) */


    /*Utility Functions*/

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
    } /* function getColor(FB) */

    function CreateCode() {

        return Math.floor(Math.random() * 10000000000);
    };  /* function CreateCode() */

    function CreateDiv(ParentID, ChildID) {

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

    function shuffleByCond(array, ntrial) {

        var postcond = [];
        var arrayMix = [];
        let i = 0;

        for (c = 0; c < array.length; c = c + array.length / ntrial) {

            postcond[i] = array.slice(c, c + array.length / ntrial);
            i++;

        }

        postcond = shuffle(postcond);

        for (c = 0; c < ntrial; c++) {

            for (i = 0; i < array.length / ntrial; i++) {

                arrayMix.push(postcond[c][i]);
            }
        }

        return arrayMix;

    };

    function hasRepetitiveValues(tab, lim) {
        compt = 0;
        for (index = 0; index < tab.length - 1; index++) {
            if (tab[index][0] == tab[index + 1][0]) {
                compt = compt + 1;
            } else {
                compt = 0;
            }
            if (compt == lim) {
                return true;
            }
        }
        return false;
    };  /* function hasRepetitiveValues(tab,lim) */


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

    /* ------------------------------------------------------------------------------------- */
    const sum = arr => arr.reduce((a, b) => a + b, 0);

    function randint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function GetBrowser() {

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
    } /* function GetBrowser() */

    function GetOS() {
        var OSName = "Unknown OS";
        if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
        return OSName;
    } /* function GetOS() */


    /*Experiment Functions*/

    function GetUserID() {

        CreateDiv('Stage', 'TextBoxDiv');

        if (language == 'en') {
            //var Title = '<H3 align = "justify">Before you start, please:<br><br>- maximize your browser window<br><br>- switch off phone/e-mail/music & anything else distracting<br><br>- and please enter your Prolific ID: <input type="text" id = "textbox_id" name="ID"></H3>';
            var Title = '<H3 align = "center">Please enter your Prolific ID: <input type="text" id = "textbox_id" name="ID"></H3>';
            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toConsent" value="Next" ></div>';

        } else if (language == 'fr') {
            var Title = '<H3 align = "center">Veuillez choisir un identifiant : <input type="text" id = "textbox_id" name="ID"></H3>';
            var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toConsent" value="Suivant" ></div>';
        }

        var TextInput = '';
        $('#TextBoxDiv').html(Title + TextInput);

        $('#Bottom').html(Buttons);

        $('#toConsent').click(function () {

            if (document.getElementById('textbox_id').value != '') {

                subID = document.getElementById('textbox_id').value;
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                Consent();
            } else {
                if (language == 'en') {
                    alert('You must enter your Prolific ID.');
                } else if (language == 'fr') {
                    alert('Vous devez entrer un identifiant.');
                }
            }
        });
    };  /* function GetUserID() */

});



