import {useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import {Octicons,Ionicons} from '@expo/vector-icons';
import CodeInputField from '../components/CodeInputField';
import {ActivityIndicator, TouchableOpacity, Text, View} from 'react-native';
import ResendTimer from '../components/ResendTimer';
import VerificationModal from '../components/VerificationModal';
import { COLORS, Constants } from "../constants";

// get status bar height
const StatusBarHeight = Constants.statusBarHeight;

const OtpVerification = () => {
    const [code, setCode] = useState('');
    //this will be a boolean which will be true whenever our input field is full
    //pin ready can be true or false 
    const [pinReady, setPinReady] = useState(false);

    //verification button
    const [verifying, setVerifying] = useState(false);

    //preferred length of our otp code
    const MAX_CODE_LENGTH = 4;

    //modal
    const [modalVisible, setModalVisible] = useState(false);
    //determine whether the request succeeded or failed
    const [verificationSuccessful, setVerificationSuccessful] = useState(false);

    //store whatever message we receive from our server
    const [requestMessage, setRequestMessage] = useState('');

    //this state monitors the state of the resend system
    const [resendingEmail, setResendingEmail] = useState(false);
    //the resend status has the following values: resend, sent, failed
    const [resendStatus, setResendStatus] = useState('Resend');

    //resend timer
    const [timeLeft,setTimeLeft] = useState(null);

    //target time. This is the maximum number of seconds of our timer
    const [targetTime,setTargetTime] = useState(null);

    //active resend will be true whenever the system is ready to allow a resend request
    const [activeResend,setActiveResend] = useState(false);

    //the timer will be triggered at an interval and we use this variable to monitor that
    let resendTimerInterval;

    //function to calculate the time left in the timer
    //function accepts a final time parameter. This is a value in milli seconds reffereing to when the timer is supposed to end in the future
    const calculateTimeLeft = (finalTime) => { 
        //first we do is to find the difference
        const difference = finalTime - +new Date(); //the + before the new keyword is used to convert the date to a number. It is a shorthand for the syntax 
        if(difference >= 0 ) {
            setTimeLeft(Math.round(difference/1000));
        } else {
            //there is no time to wait
            setTimeLeft(null);
            //clear the current interval
            clearInterval(resendTimerInterval);
            setActiveResend(true);//use to activate the resend button
        }

    }

    //trigger the timer function
    //this triggers the time to work
    const triggerTimer = (targetTimeInSeconds = 30) => { 
        setTargetTime(targetTimeInSeconds);
        //disallow recent request
        setActiveResend(false);
        //calculate our final time
        const finalTime = +new Date() + (targetTimeInSeconds * 1000);

        resendTimerInterval = setInterval(() => {
            calculateTimeLeft(finalTime),1000; //this means our function should be called every second 
    });
    }

    useEffect(() => { 
        triggerTimer();

        //to prevent memory leaks, once the component unmounts, we clear the interval
        return () => { 
            clearInterval(resendTimerInterval);
        }
    }, []);
 

    //function to submit the otp for verification
    const submitOTPVerification = async () => {
        setVerifying(true);

    }

    //create a resend email async function
    const resendEmail = async () => { 
        //set the resend status to sending
        setResendStatus('Sending');
        //set the resending email to true
        setResendingEmail(true);
    }

    //persist login after verification
    const persistLoginAfterOTPVerification = async () => { 

    }

  return (
    <KeyboardAvoidingWrapper>
        <View style={{alignItems:'center', flex:1,padding:25,paddingTop: StatusBarHeight + 30, backgroundColor: COLORS.white}}>
            <View style={{flex:1, justifyContent:'center',padding:20}}>
                <View style={{width:250, height:250, backgroundColor:COLORS.lightGreen,borderRadius:250,justifyContent:'center',alignItems:'center'}}>
                    <StatusBar  style="dark"/>
                    <Octicons name="lock" size={125} color={COLORS.brand}/>
                </View>
            </View>
            
            <View style={{flex:1, justifyContent:'center',padding:20,justifyContent:'space-around'}}>
                <Text style={{fontSize:25, fontSize:30,textAlign:'center',fontWeight:'bold',color: COLORS.brand, padding:10}}>Account Verification </Text>
                <Text style={{color:COLORS.gray, fontSize:15,textAlign:'center'}}> Please enter the 4 digit code sent to 
                    <Text style={{fontWeight:'bold',fontStyle:'italic'}}>
                        {` testmail@gmail.com`}
                    </Text>
                </Text>

                <CodeInputField 
                    setPinReady={setPinReady}
                    code={code}
                    setCode={setCode}
                    maxLength={MAX_CODE_LENGTH}
                />
                {!verifying && pinReady && (
                    <TouchableOpacity style={{backgroundColor:COLORS.green, flexDirection:'row',padding:15,justifyContent:'center',alignItems:'center',borderRadius:5,marginVertical:5,height:60}} onPress={submitOTPVerification}>
                       <Text style={{color:COLORS.white, fontSize:16}}>Verify </Text>
                       <Ionicons name="checkmark-circle" size={25} color={COLORS.white}/>
                   </TouchableOpacity>
                )}

                {!verifying && !pinReady && (
                    <TouchableOpacity style={{backgroundColor:COLORS.lightGreen, flexDirection:'row',padding:15,justifyContent:'center',alignItems:'center',borderRadius:5,marginVertical:5,height:60}} >
                      <Text style={{color:COLORS.primary, fontSize:16}}>Verify </Text>
                       <Ionicons name="checkmark-circle" size={25} color={COLORS.primary}/>
                    </TouchableOpacity>
                )}

                {verifying  && (
                   <TouchableOpacity disabled={true} style={{backgroundColor:COLORS.green, flexDirection:'row',padding:15,justifyContent:'center',alignItems:'center',borderRadius:5,marginVertical:5,height:60}} >
                       <ActivityIndicator size="large" color={COLORS.white}/>
                   </TouchableOpacity>
                )}

                <ResendTimer 
                    activeResend={activeResend}
                    resendStatus={resendStatus}
                    resendingEmail={resendingEmail}
                    timeLeft={timeLeft}
                    targetTime={targetTime}
                    resendEmail={resendEmail}
                />

            </View>

            <VerificationModal 
                successful = {verificationSuccessful}
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
                persistLoginAfterOTPVerification={persistLoginAfterOTPVerification}
            />
        </View>   
    </KeyboardAvoidingWrapper>
  )
}

export default OtpVerification;