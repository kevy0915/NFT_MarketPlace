//1. import all requred packages,hooks and components
//===================================================
import * as yup from 'yup';
import { Formik } from 'formik';
import axios from './../api/axios';
import {
  IconBg,
  MsgBox,
  TopHalf,
  LeftIcon,
  SubTitle,
  RightIcon,
  ButtonText,
  FormikError,
  StyledButton,
  InnerContainer,
  StyledFormArea,
  StyledContainer,
  StyledTextInput,
  StyledInputLabel
} from './../components/StyledComponents';
import { useState,useContext } from 'react';
import { COLORS,assets } from "./../constants";
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import { FocusedStatusBar,CircleButton } from './../components';
import { Octicons, Ionicons, FontAwesome} from '@expo/vector-icons';
import { CredentialsContext } from './../context/CredentialsContext';
import KeyboardAvoidingWrapper from './../components/KeyboardAvoidingWrapper';

const ChangePassword = ({navigation}) => {
    const [hidePassword, setHidePassword] = useState(true);
    const [message, setMessage] = useState();
    const [messageType, setMessageType] = useState();

    //credentials context
    const { storedCredentials, setStoredCredentials } = useContext(CredentialsContext);

    //destructure the data stored in the context
    const { accessToken,email} = storedCredentials;

    //password validation
    const passwordValidationSchema = yup.object().shape({
        currentPassword: yup
        .string()
        .required('Your current password is required'),
        password: yup
        .string()
        .min(8, ({ min }) => `Password must be at least ${min} characters`)
        .required('Password is required')
    });

    const handleChangePassword = async (formValues,setSubmitting) => {
        //clear the error message when ever the reset password button is pressed
        handleMessage(null);

        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + accessToken
          }
        }

      try {
        const response = await axios.patch("/api/change_password", JSON.stringify({ email,current_password: formValues.currentPassword, new_password: formValues.password, confirm_password: formValues.confirmPassword }), config);
        const result = response.data;
        const { status, message } = result;

        if (status !== 'SUCCESS') {
          handleMessage(message, status);
        } else { 
          //Logout the user 
          handleUserLogout();
          alert("Your password was changed successfully. Please login again to continue managing your account");
          navigation.navigate('Home');
        }
      } catch (error) {
        handleMessage('An error occurred. Check your network and try again');
      }
      setSubmitting(false);
    };

    const handleMessage = (message, type = 'FAILED') => {
      setMessage(message);
      setMessageType(type);
    };

    //logs out the user
    const handleUserLogout = async () => {
      await SecureStore.deleteItemAsync('nftMarketPlace')
        .then(() => {
          setStoredCredentials("");
        })
        .catch((error) => console.log(error));
    };
  

  return (
    <KeyboardAvoidingWrapper>
        <StyledContainer> 
        <FocusedStatusBar background={COLORS.primary}/>
          <CircleButton imgUrl={assets.whiteLeft} handlePress={() => navigation.goBack()} left={15} top={15}  backgroundColor= {COLORS.brand}/>
          <InnerContainer style={{marginVertical: -40}}>
          <SubTitle style={{marginTop: 40}}>Change Your Password</SubTitle>
          <TopHalf>
                <IconBg>
                    <FontAwesome name="exchange" size={125} color={COLORS.brand}/>
                </IconBg>
            </TopHalf>
            
            <Formik
               initialValues={{currentPassword: '',password: '', confirmPassword: ''}}
               validationSchema={passwordValidationSchema}
               onSubmit={(values, { setSubmitting }) => {
                 if (values.currentPassword == '' || values.password == '' || values.confirmPassword == '') {
                   handleMessage('Please fill in all fields');
                   setSubmitting(false);
                 }  else if (values.password !== values.confirmPassword) {
                    handleMessage('Passwords do not match');
                    setSubmitting(false);
                  } else {
                    handleChangePassword(values, setSubmitting);
                 }
               }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, isSubmitting, errors, touched}) => (
                <StyledFormArea>
                
                  <MyTextInput
                    label="Current Password"
                    placeholder="* * * * * * * *"
                    placeholderTextColor={COLORS.darkLight}
                    onChangeText={handleChange('currentPassword')}
                    onBlur={handleBlur('currentPassword')}
                    value={values.currentPassword}
                    secureTextEntry={hidePassword}
                    icon="lock"
                    isPassword={true}
                    hidePassword={hidePassword}
                    setHidePassword={setHidePassword}
                  />
                   {touched.currentPassword && errors.currentPassword &&
                   <FormikError>{errors.currentPassword}</FormikError>
                  }
                  <MyTextInput
                    label="New Password"
                    placeholder="* * * * * * * *"
                    placeholderTextColor={COLORS.darkLight}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    secureTextEntry={hidePassword}
                    icon="lock"
                    isPassword={true}
                    hidePassword={hidePassword}
                    setHidePassword={setHidePassword}
                  />
                   {touched.password && errors.password &&
                   <FormikError>{errors.password}</FormikError>
                  }

                  <MyTextInput
                    label="Confirm New Password"
                    placeholder="* * * * * * * *"
                    placeholderTextColor={COLORS.darkLight}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                    secureTextEntry={hidePassword}
                    icon="lock"
                    isPassword={true}
                    hidePassword={hidePassword}
                    setHidePassword={setHidePassword}
                  />
                  <MsgBox type={messageType}>{message}</MsgBox>

                  {!isSubmitting && (
                    <StyledButton onPress={handleSubmit}>
                      <ButtonText>Update</ButtonText>
                    </StyledButton>
                  )}
                  {isSubmitting && (
                    <StyledButton disabled={true}>
                      <ActivityIndicator size="large" color={COLORS.white} />
                    </StyledButton>
                  )}
                </StyledFormArea>
              )}
            </Formik>
          </InnerContainer>
        </StyledContainer>
    </KeyboardAvoidingWrapper>
    
  )
}


const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
    return (
      <View>
        <LeftIcon>
          <Octicons name={icon} size={30} color={COLORS.brand} />
        </LeftIcon>
        <StyledInputLabel>{label}</StyledInputLabel>
        <StyledTextInput {...props} />
          <RightIcon
            onPress={() => {
              //toggle the value of the hide password on press
              setHidePassword(!hidePassword);
            }}
          >
            <Ionicons name={hidePassword ? 'md-eye-off' : 'md-eye'} size={30} color={COLORS.darkLight} />
          </RightIcon>
      </View>
    );
  };

export default ChangePassword;