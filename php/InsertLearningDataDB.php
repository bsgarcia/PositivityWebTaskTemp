<?php

include 'connectDB.php';

$EXP 		= stripslashes(htmlspecialchars($_POST['exp']));
$EXPID 		= stripslashes(htmlspecialchars($_POST['expID']));
$ID 		= stripslashes(htmlspecialchars($_POST['id']));
$TEST 		= stripslashes(htmlspecialchars($_POST['test']));
$TRIAL 		= stripslashes(htmlspecialchars($_POST['trial']));
$COND 		= stripslashes(htmlspecialchars($_POST['condition']));
$SYML 		= stripslashes(htmlspecialchars($_POST['symL']));
$SYMR 		= stripslashes(htmlspecialchars($_POST['symR']));
$LR 		= stripslashes(htmlspecialchars($_POST['choice_left_right']));
$RTIME 		= stripslashes(htmlspecialchars($_POST['reaction_time']));
$OUT 		= stripslashes(htmlspecialchars($_POST['outcome']));
$CF_OUT 	= stripslashes(htmlspecialchars($_POST['cf_outcome']));
$CHOICE 	= stripslashes(htmlspecialchars($_POST['choice']));
$CORRECT_CHOICE 	= stripslashes(htmlspecialchars($_POST['correct_choice']));
$REW 		= stripslashes(htmlspecialchars($_POST['reward']));
$SESSION 	= stripslashes(htmlspecialchars($_POST['session']));
$P1 		= stripslashes(htmlspecialchars($_POST['p1']));
$P2 		= stripslashes(htmlspecialchars($_POST['p2']));
$OP1 		= stripslashes(htmlspecialchars($_POST['option1']));
$OP2 		= stripslashes(htmlspecialchars($_POST['option2']));
$INV 		= stripslashes(htmlspecialchars($_POST['inverted']));
$CTIME 		= stripslashes(htmlspecialchars($_POST['choice_time']));

$stmt = $db->prepare("INSERT INTO learning_data VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
$stmt->bind_param("sssddiiiiiiiiiiiiiiiii",
    $EXP,$EXPID,$ID, $P1,$P2, $RTIME, $OUT, $CF_OUT, $CHOICE, $CORRECT_CHOICE, $TEST,$TRIAL,$COND,$SYML,$SYMR,$LR,$REW,$SESSION,$OP1,$OP2,$INV,$CTIME
);
$stmt->execute();
$err = $stmt->errno ;
$data[] = array(
      'ErrorNo' => $err,
    );
$stmt->close();
 $db->close();
echo json_encode($data);
 ?>
