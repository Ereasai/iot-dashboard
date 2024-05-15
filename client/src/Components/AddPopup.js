import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { NewWidgetPopup } from './NavbarButtons';

const AddPopup = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} fullScreen={true}>
                <DialogTitle>Add New Item</DialogTitle>
                {/* <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" type="text" fullWidth />
                    <TextField margin="dense" label="Description" type="text" fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={onClose} color="primary">
                        Add
                    </Button>
                </DialogActions> */}

                <DialogContent>
                    <NewWidgetPopup onClose={onClose}/>
                </DialogContent>
        </Dialog>
    );
};

export default AddPopup;
