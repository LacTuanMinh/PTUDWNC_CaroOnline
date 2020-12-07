import React, { useState } from 'react'
import { DropzoneDialog } from 'material-ui-dropzone'
import Button from '@material-ui/core/Button';
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: '10px 0 40px',
        alignItems: 'center'
    }
}));

export default function ImageUploadDialog() {
    const classes = useStyles();

    const [open, setOpen] = useState(false);
    const [files, setFile] = useState([]);

    const handleClose = () => {
        setOpen(false);
    }

    const handleSave = (files) => {
        //Saving files to state for further use and closing Modal.
        // this.setState({
        //     files: files,
        //     open: false
        // });
        console.log(files);
        setFile(files);
        setOpen(false);
    }

    const handleOpen = () => {
        // this.setState({
        //     open: true,
        // });
        setOpen(true);

    }

    return (
        <div className={classes.margin}>
            <Button onClick={handleOpen} variant="contained" color="primary" component="span" >
                <AddPhotoAlternateIcon /> Choose an image
            </Button>

            <DropzoneDialog
                open={open}
                onSave={handleSave}
                acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
                // showPreviews={true}
                showPreviewsInDropzone={true}
                showPreviews={false}
                showFileNames={true}
                filesLimit={1}
                maxFileSize={5000000}
                onClose={handleClose}
            />
        </div>
    );
}