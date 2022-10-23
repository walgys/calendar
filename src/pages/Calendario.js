import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { useContext, useEffect, useRef, useState } from 'react';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Slide,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  createMeet,
  deleteMeet,
  getDayMeets,
  getDayMeetsByDocId,
  getUsers,
  updateMeet,
} from '../utilitarios/data';
import { AuthContext } from '../contexts/authContext';
import './calendario.css';
import { Box } from '@mui/system';
import { useSnackbar } from 'notistack';
const Calendario = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  let today = new Date();
  let month = today.getMonth();
  const citaBase = {
    timeIndex: 0,
    owner: {},
    subject: '',
    description: '',
    members: [],
    invited: [],
  };
  const [date, setDate] = useState(null);
  const [meets, setMeets] = useState([]);
  const [selectedMeet, setSelectedMeet] = useState(citaBase);
  const [modal, setModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [docId, setDocId] = useState('');
  const [firstSearch, setFirstSearch] = useState(true);
  const [daySelected, setDaySelected] = useState(false);
  const [personName, setPersonName] = useState([]);
  const [users, setUsers] = useState([]);
  const otherDate = new Date();
  otherDate.setDate(14);

  let invalidDates = [today, otherDate];
  const maxSubjectLength = 40;
  const maxDescriptionLength = 200;

  const dayHours = [...Array(24).keys()].fill(citaBase);

  let minDate = new Date();
  minDate.setMonth(6);
  minDate.setDate(19);
  //minDate.setFullYear(prevYear);

  let maxDate = new Date();
  maxDate.setMonth(11);
  maxDate.setDate(17);
  //maxDate.setFullYear(nextYear);

  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: [
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
    ],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ],
    monthNamesShort: [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ],
    today: 'Hoy',
    clear: 'Limpiar',
  });

  useEffect(() => {
    setMeets(dayHours);
  }, []);

  useEffect(() => {
    console.log(meets)
  }, [meets])
  

  const onSelectDate = async (value) => {
    if (firstSearch) {
      const { retrievedMeets, fechaDocId } = await getDayMeets(
        value.toISOString().split('T')[0]
      );
      setDocId(fechaDocId);
      let newMeets = [...dayHours];
      retrievedMeets.forEach(
        (retrievedMeet) => (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
      );
      setMeets(newMeets);
      setFirstSearch(false);
    }
    setDaySelected(!daySelected);
    setDate(value);
  };

  const changeInfo = async () => {
    if (!firstSearch) {
      const { retrievedMeets, fechaDocId } = await getDayMeets(
        date.toISOString().split('T')[0]
      );
      setDocId(fechaDocId);
      let newMeets = [...dayHours];
      retrievedMeets.forEach(
        (retrievedMeet) => (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
      );
      setMeets(newMeets);
    }
    setDaySelected(true);
  };

  const isOwner = (meet) => {
    return meet.owner.uid === user.uid;
  };

  const isInvited = (meet) => {
    return meet.invited.find((invite) => invite.uid === user.uid);
  };

  const notMember = (meet) => {
    return !meet.members.find((member) => member.uid === user.uid);
  };

  const onAsistir = (meet) => {
    console.log(user);
    const newMeets = meets.map((meetState) =>
      meetState.id === meet.id
        ? {
            ...meet,
            members: [
              ...meetState.members,
              { uid: user.uid, displayName: user.displayName },
            ],
          }
        : meetState
    );
    setMeets(newMeets);
    updateMeet(
      {
        ...meet,
        members: [
          ...meet.members,
          { uid: user.uid, displayName: user.displayName },
        ],
      },
      docId
    ).then((result) => {
      if (result === 'ok') {
        enqueueSnackbar('Cita modificada', { variant: 'info' });
      } else {
        enqueueSnackbar(`Error al modificar cita: ${result}`, {
          variant: 'error',
        });
      }
    });
    if (docId != '') {
      getDayMeetsByDocId(docId).then(({ retrievedMeets, fechaDocId }) => {
        setDocId(fechaDocId);
        let newMeets = [...dayHours];
        retrievedMeets.forEach(
          (retrievedMeet) => (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
        );
        setMeets(newMeets);
      });
    } else {
      getDayMeets(date.toISOString().split('T')[0]).then(
        ({ retrievedMeets, fechaDocId }) => {
          setDocId(fechaDocId);
          let newMeets = [...dayHours];
          retrievedMeets.forEach(
            (retrievedMeet) =>
              (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
          );
          setMeets(newMeets);
        }
      );
    }
  };

  const onDesistir = (meet) => {
    console.log(user);
    const newMeets = meets.map((meetState) =>
      meetState.id === meet.id
        ? {
            ...meet,
            members: meet.members.filter((member) => member.uid !== user.uid),
          }
        : meetState
    );
    updateMeet(
      {
        ...meet,
        members: meet.members.filter((member) => member.uid !== user.uid),
      },
      docId
    ).then((result) => {
      if (result === 'ok') {
        enqueueSnackbar('Cita modificada', { variant: 'info' });
      } else {
        enqueueSnackbar(`Error al modificar cita: ${result}`, {
          variant: 'error',
        });
      }
    });
    if (docId != '') {
      getDayMeetsByDocId(docId).then(({ retrievedMeets, fechaDocId }) => {
        setDocId(fechaDocId);
        let newMeets = [...dayHours];
        retrievedMeets.forEach(
          (retrievedMeet) => (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
        );
        setMeets(newMeets);
      });
    } else {
      getDayMeets(date.toISOString().split('T')[0]).then(
        ({ retrievedMeets, fechaDocId }) => {
          setDocId(fechaDocId);
          let newMeets = [...dayHours];
          retrievedMeets.forEach(
            (retrievedMeet) =>
              (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
          );
          setMeets(newMeets);
        }
      );
    }
    setMeets(newMeets);
  };

  const handleClose = () => {
    setPersonName([]);
    setModal(false);
  };

  const crearCita = (index) => {
    setModalType('crearCita');
    getUsers().then((usersRetrieved) => setUsers(usersRetrieved));
    setSelectedMeet({
      ...citaBase,
      timeIndex: index,
      owner: { uid: user.uid, displayName: user.displayName },
      members: [{ uid: user.uid, displayName: user.displayName }],
    });
    setModal(true);
  };

  const modificarCita = (meet) => {
    setModalType('modificarCita');
    getUsers().then((usersRetrieved) => setUsers(usersRetrieved));
    setPersonName(meet.invited);
    setSelectedMeet(meet);
    setModal(true);
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    let newPersons;
    const found = personName.some(
      (person) => person.uid === value[value.length - 1].uid
    );
    if (found) {
      newPersons = personName.filter(
        (person) => person.uid !== value[value.length - 1].uid
      );
    } else {
      newPersons = value;
    }
    setPersonName(newPersons);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const handleSave = () => {
    const newMeet = { ...selectedMeet, invited: personName };
    let result;
    if (modalType === 'crearCita')
      createMeet(newMeet, docId).then((result) => {
        if (result === 'ok') {
          enqueueSnackbar('Cita creada', { variant: 'success' });
        } else {
          enqueueSnackbar(`Error al crear cita: ${result}`, {
            variant: 'error',
          });
        }
        if (docId != '') {
          getDayMeetsByDocId(docId).then(({ retrievedMeets, fechaDocId }) => {
            setDocId(fechaDocId);
            let newMeets = [...dayHours];
            retrievedMeets.forEach(
              (retrievedMeet) => (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
            );
            setMeets(newMeets);
          });
        } else {
          getDayMeets(date.toISOString().split('T')[0]).then(
            ({ retrievedMeets, fechaDocId }) => {
              setDocId(fechaDocId);
              let newMeets = [...dayHours];
              retrievedMeets.forEach(
                (retrievedMeet) =>
                  (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
              );
              setMeets(newMeets);
            }
          );
        }
      });
    if (modalType === 'modificarCita')
      updateMeet(newMeet, docId).then((result) => {
        if (result === 'ok') {
          enqueueSnackbar('Cita modificada', { variant: 'info' });
        } else {
          enqueueSnackbar(`Error al modificar cita: ${result}`, {
            variant: 'error',
          });
        }
        if (docId != '') {
          getDayMeetsByDocId(docId).then(({ retrievedMeets, fechaDocId }) => {
            setDocId(fechaDocId);
            let newMeets = [...dayHours];
            retrievedMeets.forEach(
              (retrievedMeet) => (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
            );
            setMeets(newMeets);
          });
        } else {
          getDayMeets(date.toISOString().split('T')[0]).then(
            ({ retrievedMeets, fechaDocId }) => {
              setDocId(fechaDocId);
              let newMeets = [...dayHours];
              retrievedMeets.forEach(
                (retrievedMeet) =>
                  (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
              );
              setMeets(newMeets);
            }
          );
        }
      });
    
    setPersonName([]);
    setModal(false);
  };

  const handleModalChange = (key, value)=>{
    const newSelectedMeet = {...selectedMeet, [key]: value}
    setSelectedMeet(newSelectedMeet)
  }

  const removeMeet = (meet)=>{
    deleteMeet(meet, docId).then(result=>{
      if (result === 'ok') {
        enqueueSnackbar('Cita eliminada', { variant: 'info' });
      } else {
        enqueueSnackbar(`Error al eliminar cita: ${result}`, {
          variant: 'error',
        });
      }
      if (docId != '') {
      getDayMeetsByDocId(docId).then(({ retrievedMeets, fechaDocId }) => {
        setDocId(fechaDocId);
        let newMeets = [...dayHours];
        retrievedMeets.forEach(
          (retrievedMeet) => (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
        );
        setMeets(newMeets);
      });
    } else {
      getDayMeets(date.toISOString().split('T')[0]).then(
        ({ retrievedMeets, fechaDocId }) => {
          setDocId(fechaDocId);
          let newMeets = [...dayHours];
          retrievedMeets.forEach(
            (retrievedMeet) =>
              (newMeets[retrievedMeet.timeIndex] = retrievedMeet)
          );
          setMeets(newMeets);
        }
      );
    }
    });
  }

  const containerRef = useRef();
  return (
    <Paper elevation={2} style={{}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{ width: '500px', display: 'flex', justifyItems: 'center' }}
          >
            <Calendar
              style={{ width: '100%' }}
              value={date}
              onChange={(e) => onSelectDate(e.target.value)}
              locale="es"
              disabledDates={invalidDates}
              disabledDays={[0, 6]}
              inline
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
          <Slide
            direction="left"
            in={daySelected}
            onExited={() => changeInfo()}
            container={containerRef.current}
          >
            <Paper
              elevation={2}
              style={{
                minWidth: '300px',
                maxWidth: '500px',
                height: '100%',
                padding: '1rem',
                margin: '1rem',
              }}
            >
              <div
                className="noscroll"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'scroll',
                  height: '480px',
                }}
              >
                {meets.map((meet, index) => (
                  <Accordion
                    key={`hour-${index}`}
                    sx={{
                      backgroundColor:
                        Object.keys(meet.owner).length > 0
                          ? '#FAAA8D'
                          : '#8BBEB2',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      {isInvited(meet) || isOwner(meet) ? (
                        <Typography>{`(${index} hs) ${
                          (meet.subject?.length > maxSubjectLength
                            ? `${meet.subject.slice(0, maxSubjectLength)}...`
                            : meet.subject) || ''
                        }`}</Typography>
                      ) : (
                        <Typography>{`(${index} hs) ${
                          (meet.subject?.length > 0 ? `Ocupado` : '') || ''
                        }`}</Typography>
                      )}
                    </AccordionSummary>
                    {Object.keys(meet.owner).length == 0 ? (
                      <AccordionDetails sx={{ backgroundColor: 'whitesmoke' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Tooltip title="Crear nueva cita">
                            <Button
                              variant="outlined"
                              onClick={() => crearCita(index)}
                            >
                              Crear cita
                            </Button>
                          </Tooltip>
                        </div>
                      </AccordionDetails>
                    ) : (
                      (isInvited(meet) || isOwner(meet)) && (
                        <AccordionDetails
                          sx={{ backgroundColor: 'whitesmoke' }}
                        >
                          <Typography fontWeight={600} gutterBottom>
                            {meet.subject || ''}
                          </Typography>
                          <Typography>
                            {(meet.description?.length > maxDescriptionLength
                              ? `${meet.description.slice(
                                  0,
                                  maxDescriptionLength
                                )}...`
                              : meet.description) || ''}
                          </Typography>
                          {
                            <>
                              <Typography fontWeight={600} gutterBottom>
                                Asistiran:
                              </Typography>
                              <Typography fontWeight={400} gutterBottom>
                                {`${meet.members
                                  .map((member) => member.displayName)
                                  .join(',')}`}
                              </Typography>
                            </>
                          }
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            {isOwner(meet) && (
                              <Tooltip title="Modificar cita">
                                <Button
                                  variant="outlined"
                                  onClick={() => modificarCita(meet)}
                                >
                                  Modificar
                                </Button>
                              </Tooltip>
                            )}
                            {(notMember(meet) ||
                              (notMember(meet) && isOwner(meet))) && (
                              <Tooltip title="Confirmar asistencia">
                                <Button
                                  variant="outlined"
                                  onClick={() => onAsistir(meet)}
                                >
                                  Asistir
                                </Button>
                              </Tooltip>
                            )}
                            {(!notMember(meet) ||
                              (!notMember(meet) && isOwner(meet))) && (
                              <Tooltip title="Cancelar asistencia">
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => onDesistir(meet)}
                                >
                                  No asistir
                                </Button>
                              </Tooltip>
                            )}
                            {isOwner(meet) && (
                              <Tooltip title="Eliminar cita">
                                <Button color="error" variant="outlined" onClick={()=>removeMeet(meet)}>
                                  Eliminar
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </AccordionDetails>
                      )
                    )}
                  </Accordion>
                ))}
              </div>
            </Paper>
          </Slide>
        </div>
      </div>
      <Dialog fullWidth open={modal} onClose={handleClose}>
        <DialogContent>
          <TextField
            autoFocus
            sx={{ marginTop: '1rem' }}
            label="Título"
            fullWidth
            multiline
            value={selectedMeet.subject}
            onChange={e=>handleModalChange('subject', e.target.value)}
          />
          <TextField
            sx={{ marginTop: '1rem' }}
            label="Descripción"
            fullWidth
            multiline
            value={selectedMeet.description}
            onChange={e=>handleModalChange('description', e.target.value)}
          />
          <FormControl sx={{ marginTop: '1rem', width: 300 }}>
            <InputLabel id="invite-label">Invitar</InputLabel>
            <Select
              labelId="invite-label"
              id="demo-multiple-chip"
              multiple
              value={personName}
              onChange={handleChange}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value.id} label={value.displayName} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={{ ...user }}>
                  {user.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Grabar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Calendario;
