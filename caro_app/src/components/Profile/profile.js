import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ContactMailRoundedIcon from '@material-ui/icons/ContactMailRounded';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import SaveIcon from '@material-ui/icons/Save';
import ChangePasswordDialog from '../Dialogs/ChangePasswordDialog';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import ImageUploadDialog from '../Dialogs/ImageUploadDialog';
import Badge from '@material-ui/core/Badge';
import logo from '../../images/caro.ico';
import { authen } from '../../utils/helper';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  card: {
    height: '100%',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '25%',
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  cardContent: {
    flexGrow: 1,
  },
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "black"//theme.palette.secondary.main,
  },
  form: {
    width: '75%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  container: {
    display: 'inline-block',
    width: '100%'
  },
  floatRight: {
    float: "right",
    width: '60%'
  },
  floatLeft: {
    float: "left",
    width: '40%'
  },
  paperLikeShadow: {
    boxShadow: '0 4px 8px 5px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
  }
}));

export default function Profile() {
  const classes = useStyles();
  const [userName, setUserName] = useState("Minh Lạc");
  const [email, setEmail] = useState("minh@gmail.com");
  const [dateOfBirth, setDateOfBirth] = useState("16/09/1999");

  const history = useHistory();

  useEffect(() => {
    async function ComponentWillMount() {
      const token = window.localStorage.getItem('jwtToken');
      const userID = localStorage.getItem('userID');
      const res = await fetch(`${API_URL}users/profile/${userID}`, {
        method: 'POST',
        // body: JSON.stringify({ newUserName }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();

    }
    ComponentWillMount();
  }, []);


  const handleUserNameChange = async (event) => {
    event.preventDefault();
    // if (isBlankString(newUserName)) {
    //   alert('User name is a blank string')
    //   return;
    // } else if (newUserName === userName) {
    //   alert('User name hasn\'t been changed')
    //   return;
    // }
    // const userID = localStorage.getItem('userID');

    //   .then(res => {
    //     if (res.status === 200) {
    //       res.json().then(result => {

    //         alert(result.mesg);
    //         setUserName(result.userName);
    //         window.localStorage.setItem('userName', result.userName);

    //       });
    //     } else if (res.status === 400) {// error : wrong id
    //       res.json().then(result => {
    //         alert(result.mesg);
    //       });
    //     } else if (res.status === 401) {
    //       alert("You have to log in")
    //       history.push('/signin')
    //     }
    //   }).catch(err => {
    //     console.error(err);
    //     alert('Error logging in please try again');
    //   });
  };
  return (
    <>
      <Container component="main" maxWidth="lg">
        <div className={classes.container}>

          <div className={classes.floatLeft}>
            <div className={classes.paper} style={{ padding: '20px' }}>
              <img height={200} width={200} style={{ borderRadius: '8px' }}
                src={logo} alt="User avatar"
              />
              <ImageUploadDialog />
              <Card className={classes.paperLikeShadow} style={{ width: '80%' }}>
                <CardHeader
                  title={
                    <Badge color="secondary">
                      Achivement
                    </Badge>}
                  // action={
                  //   <div>
                  //     <CreateTagDialog
                  //       // colTypeID={columnType[0].colTypeID}// wentWell id is 1
                  //       colTypeID={columnType === undefined || columnType[0] === undefined ? 0 : columnType[0].colTypeID}
                  //       setTags={(tags) => setTags(tags)}
                  //       boardID={boardID}
                  //       tags={tags}
                  //       socket={socket}
                  //     />
                  //   </div>}
                  className={classes.cardHeader}
                />
                <CardContent>
                  {/* <Typography> */}

                  <table style={{ margin: '10px', width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', width: '50%' }}>Username:</td>
                        <td style={{ textAlign: 'center', width: '50%' }}>ltminh</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Elo mark:</td>
                        <td style={{ textAlign: 'center' }}>1200</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Total play(s):</td>
                        <td style={{ textAlign: 'center' }}>20</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Winned play(s):</td>
                        <td style={{ textAlign: 'center' }}>20</td>
                      </tr>
                    </tbody>

                  </table>

                  {/* </Typography> */}
                </CardContent>
              </Card>

            </div>
          </div>

          <div className={classes.floatRight}>
            <div className={classes.paper}>
              <Avatar className={classes.avatar}>
                <ContactMailRoundedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                YOUR PROFILE
              </Typography>
              <form className={classes.form} onSubmit={handleUserNameChange}>
                <Typography align="left" component="h2"><b> Name:</b> </Typography>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="userName"
                  name="userName"
                  placeholder="User name"
                  defaultValue={userName}
                  onChange={(event) => { setUserName(event.target.value); }}
                  autoFocus
                />
                <Typography align="left" component="h2"> <b>Email:</b> </Typography>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={email}
                  onChange={(event) => { setEmail(event.target.value); }}
                  autoFocus
                />
                <Typography align="left" component="h2"> <b>Date of Birth:</b> </Typography>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="dob"
                  name="dob"
                  placeholder="Date Of Birth"
                  defaultValue={dateOfBirth}
                  onChange={(event) => { setDateOfBirth(event.target.value); }}
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="outlined"
                  color="primary"
                  className={classes.submit}
                  startIcon={<SaveIcon />}
                // action
                >
                  Save Change
                </Button>
                <Typography align="left" component="h2" style={{ marginTop: 10, marginBottom: 12, fontWeight: 'bold' }}> Passowrd: </Typography>
                <ChangePasswordDialog />
              </form>
            </div>

          </div>
        </div>
      </Container>
    </>
  );
}
