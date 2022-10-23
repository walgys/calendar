import { database } from './fb';
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  addDoc,
  runTransaction,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';

export const updateMeet = async (meet, docId) => {
    let result = 'ok';
        await runTransaction(database, async (transaction) => {
        const meetInfoRef = doc(database, `calendarMeets/${docId}/meets`, meet.id);
        console.log(meetInfoRef)
        const {id, ...rest} = meet;
        updateDoc(meetInfoRef, {...rest});
    }).catch((err) => {
        result = err;
        console.log(err);
      });
    return result;
}

export const createMeet = async (meet, docId) => {
    let result = 'ok';
        await runTransaction(database, async (transaction) => {
        const meetInfoRef = collection(database, `calendarMeets/${docId}/meets`)
        addDoc(meetInfoRef, meet);
    }).catch((err) => {
        result = err;
        console.log(err);
      });
    return result;
}

export const deleteMeet = async (meet, docId) => {
    let result = 'ok';
        await runTransaction(database, async (transaction) => {
        const meetInfoRef = doc(database, `calendarMeets/${docId}/meets`, meet.id);
        deleteDoc(meetInfoRef);
    }).catch((err) => {
        result = err;
        console.log(err);
      });
    return result;
}

export const getDayMeets = async (date) => {
    try{
        const meetsRef = collection(database, 'calendarMeets');
        const q = query(meetsRef, where('fecha', '==', date));
        const docs = await getDocs(q);
        console.log(docs)
        let meets = [];
        let docId;
        docs.docs.forEach((docIn) => {
            docId = docIn.id
            //meets.push({ id: doc.id, ...doc.data() });
        });
        const docRef = collection(database, `calendarMeets/${docId}/meets`);
        const meetCol = await getDocs(docRef);
        meetCol.docs.forEach(meetFire => meets.push({id:meetFire.id, ...meetFire.data()}))
        return {retrievedMeets: meets, fechaDocId: docId};
    }catch(err){
        return {retrievedMeets: [], fechaDocId: '', error: err}
    }
}

export const getDayMeetsByDocId = async (docId) => {
    try{
        let meets = [];      
        const docRef = collection(database, `calendarMeets/${docId}/meets`);
        const meetCol = await getDocs(docRef);
        meetCol.docs.forEach(meetFire => meets.push({id:meetFire.id, ...meetFire.data()}))
        return {retrievedMeets: meets, fechaDocId: docId};
    }catch(err){
        return {retrievedMeets: [], fechaDocId: '', error: err}
    }
}

export const getUsers = async ()=>{
    try{
        const usersRef = collection(database, 'calendarUsers');
        const docs = await getDocs(usersRef);
        let users = [];
        docs.docs.forEach((user) => {
            users.push({...user.data()});
        });
        return users;
    }catch(err){console.log(err)}
}

export const createUsers = async (user)=>{
    await runTransaction(database, async (transaction) => {
        const usersRef = collection(database, 'calendarUsers');
        const docs = await getDocs(usersRef);
        let users=[];
        docs.docs.forEach((fireUser) => {
            users.push({...fireUser.data()})
        });
        const found = users.some(u=>u.uid === user.uid);
        if(!found) addDoc(usersRef, {uid: user.uid, email: user.email, displayName: user.displayName});
    }).catch((err) => {
        console.log(err);
      });
}