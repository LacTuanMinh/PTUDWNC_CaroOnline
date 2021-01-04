import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { InformationSnackbar } from '../../SnackBar/snackbar';
import { isEmailPattern, isBlankString, containsBlank } from '../../../utils/helper';
import config from '../../../constants/config.json';

const API_URL = config.API_URL_TEST;

export default function ResetPasswordDialog() {
  const userID = localStorage.getItem('userID');

  const [open, setOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [showSnackbar, setShowSnackBar] = useState(false);
  const [content, setContent] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSendEmail = async () => {

    if (isBlankString(emailInput) || isBlankString(usernameInput)) {
      setContent("Input can not be empty.");
      setShowSnackBar(true);
      return;
    }
    if (containsBlank(usernameInput)) {
      setContent("Username can not contain blank space.");
      setShowSnackBar(true);
      return;
    }
    if (isEmailPattern(emailInput) === false) {
      setContent("Email is not valid.");
      setShowSnackBar(true);
      return;
    }
    const data = {
      Username: usernameInput,
      Email: emailInput
    }
    const res = await fetch(`${API_URL}/forgotpassword`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 200) {
      const result = await res.json();
      setContent(result.msg);
      setShowSnackBar(true);
      setOpen(false);
    } else {
      const result = await res.json();
      setContent(result.msg);
      setShowSnackBar(true);
    }
  }

  return (
    <div>
      <InformationSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} content={content} />
      <Link onClick={handleClickOpen} variant="body2" style={{ cursor: 'pointer ' }}>
        {"Forgot password?"}
      </Link>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Reset password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To reset to your password, please enter your username and <b>valid email</b> address here. Then you need to check this mail for further information.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSendEmail} color="secondary">
            Send
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
