import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
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
import defaultAvatar from '../../images/defaultAvatar.jpg';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import ReplayIcon from '@material-ui/icons/Replay';
import SimpleSnackbar from '../SnackBar/snackbar';
import config from '../../constants/config.json';
import { isBlankString, isEmailPattern } from '../../utils/helper';

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
  },
  hidden: {
    display: 'none'
  }
}));

export default function Profile() {
  const classes = useStyles();
  const userID = localStorage.getItem('userID');
  const token = localStorage.getItem('jwtToken')

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(true);
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState((new Date()).toISOString());
  const [validDOB, setValidDOB] = useState(true);
  const [avatar, setAvatar] = useState({});
  const [info, setInfo] = useState({});
  const [contents, setContents] = useState([]);
  const [showSnackbar, setShowSnackBar] = useState(false);

  useEffect(() => {
    async function ComponentWillMount() {
      const token = window.localStorage.getItem('jwtToken');
      const userID = localStorage.getItem('userID');
      const res = await fetch(`${API_URL}/users/profile/${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();
      setInfo(result.userInfo);
      setName(result.userInfo.Name);
      setEmail(result.userInfo.Email);
      setAvatar(result.userInfo.Avatar);
      setDateOfBirth(result.userInfo.DateOfBirth);
    }
    ComponentWillMount();
  }, []);

  useEffect(() => {
    async function retrieveAvatar() {
      const res = await fetch(`${API_URL}/users/avatar/${userID}`, {
        method: 'GET',
        headers: {
          ContentType: 'image/jpeg',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        const result = await res.blob();
        setAvatar(URL.createObjectURL(result));
      }
    }
    retrieveAvatar();
  }, [setAvatar]);

  const handleNameChange = (name) => {
    setName(name);
    if (isBlankString(name)) {
      setContents(contents => [...contents.filter(content => content.id !== 1), { id: 1, msg: "Name field can't be empty!!!" }]);
      setValidName(false);
    } else {
      setContents(contents.filter(content => content.id !== 1));
      setValidName(true);
    }
  }

  const handleEmailChange = (email) => {
    setEmail(email);
    if (isBlankString(email)) {
      setContents(contents => [...contents.filter(content => content.id !== 2), { id: 2, msg: "Email field can't be empty!!!" }]);
      setValidEmail(false);
    }
    else if (!isEmailPattern(email)) {// === false
      setContents(contents => [...contents.filter(content => content.id !== 2), { id: 2, msg: "Email field doesn't match the email format!!!" }]);
      setValidEmail(false);
    }
    else {
      setContents(contents.filter(content => content.id !== 2));
      setValidEmail(true);
    }
  }

  const handleDateChange = (date) => {
    setDateOfBirth(date.toISOString());
    const now = new Date().toISOString()
    if (dateOfBirth < now) {
      setContents(contents.filter(content => content.id !== 3));
      setValidDOB(true);
    }
    else {
      setContents(contents => [...contents.filter(content => content.id !== 3), { id: 3, msg: "Invalid date!!!" }]);
      setValidDOB(false);
    }
  }

  const handleSaveChange = async () => {
    if (validDOB && validEmail && validName) {

      const data = {
        Name: name,
        Email: email,
        DateOfBirth: dateOfBirth
      }

      const res = await fetch(`${API_URL}/users/profile/updateinfo/${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      // const result = await res.json();

      if (res.status === 200) {

        const infoCopy = JSON.parse(JSON.stringify(info));

        infoCopy.Name = data.Name;
        infoCopy.Email = data.Email;
        infoCopy.DateOfBirth = data.DateOfBirth;
        setInfo(infoCopy);
        setShowSnackBar(true);

      } else {
        // alert("Some error when updating!")
      }

    } else {
      setShowSnackBar(true);
    }
  }

  const handleResetInfo = () => {
    setName(info.Name);
    setEmail(info.Email);
    setDateOfBirth(info.DateOfBirth);
    setValidEmail(true);
    setValidName(true);
    setValidDOB(true);
    setContents([]);
  }

  return (
    <>
      <SimpleSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} contents={contents} />

      <Container component="main" maxWidth="lg">
        <Grid container spacing={2}>

          <Grid item xs={12} md={5}>
            <div className={classes.paper} style={{ padding: '20px' }}>
              <img height={200} width={200} style={{ borderRadius: '8px' }} className={classes.paperLikeShadow}
                src={avatar ? avatar : defaultAvatar} alt="User avatar"
              />
              <ImageUploadDialog setAvatar={setAvatar} setShowSnackBar={setShowSnackBar} />
              {/* <Card className={classes.paperLikeShadow} style={{ width: '70%' }}>
                <CardHeader
                  title={
                    <Badge color="secondary">
                      Achivement
                    </Badge>}
                  className={classes.cardHeader}
                />
                <CardContent>
                  <table style={{ margin: '10px', width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', width: '50%' }}>Username:</td>
                        <td style={{ textAlign: 'center', width: '50%' }}>{info.Username}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Elo mark:</td>
                        <td style={{ textAlign: 'center' }}>{info.Elo}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Total play(s):</td>
                        <td style={{ textAlign: 'center' }}>{info.PlayCount}</td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Winned play(s):</td>
                        <td style={{ textAlign: 'center' }}>{info.WinCount}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card> */}
            </div>
          </Grid>

          <Grid item xs={12} md={7}>
            <div className={classes.paper}>
              {/* <Avatar className={classes.avatar}>
                <ContactMailRoundedIcon />
              </Avatar> */}
              <Typography component="h2" variant="h5">
                YOUR PROFILE
                <IconButton onClick={handleResetInfo} title="Reset information" color="primary" aria-label="add an alarm" style={{ fontSize: 'large' }} >
                  <ReplayIcon />
                </IconButton>
              </Typography>
              <div className={classes.form} >

                <div className={classes.container}>
                  <Typography className={classes.floatLeft} align="left" component="h2"><b> Name:</b> </Typography>
                  {validName ?
                    <></>
                    :
                    <Typography className={classes.floatRight} align="right" style={{ color: "red" }}>Invalid</Typography>
                  }
                </div>
                <TextField variant="outlined" margin="normal" required fullWidth autoFocus
                  placeholder="Username" value={name}
                  onChange={(event) => { handleNameChange(event.target.value); }}
                />

                <div className={classes.container}>
                  <Typography className={classes.floatLeft} align="left" component="h2"> <b>Email:</b>  </Typography>
                  {validEmail ?
                    <></>
                    :
                    <Typography className={classes.floatRight} align="right" style={{ color: "red" }}>Invalid</Typography>
                  }
                </div>
                <TextField variant="outlined" margin="normal" required fullWidth
                  id="email" name="email" placeholder="Email" value={email}
                  onChange={(event) => { handleEmailChange(event.target.value); }}
                />

                <div className={classes.container}>
                  <Typography align="left" component="h2" className={classes.floatLeft}>
                    <b>Date of Birth:</b>
                  </Typography>
                  {validDOB ?
                    <></>
                    :
                    <Typography className={classes.floatRight} align="right" style={{ color: "red" }}>Invalid</Typography>
                  }
                </div>

                <MuiPickersUtilsProvider utils={DateFnsUtils} >
                  <KeyboardDatePicker
                    // disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    fullWidth value={dateOfBirth}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    placeholder="Date of Birth"
                  />
                </MuiPickersUtilsProvider>
                <Button type="submit" fullWidth variant="outlined" color="primary" onClick={handleSaveChange}
                  className={classes.submit} startIcon={<SaveIcon />}
                >
                  Save Change
                </Button>
                <Typography align="left" component="h2" style={{ marginTop: 10, marginBottom: 12, fontWeight: 'bold' }}> Passowrd: </Typography>
                <ChangePasswordDialog />
              </div>
            </div>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
