export async function getData(collection, id){
    const docRef = db.collection(collection).doc(id);
    const doc = await docRef.get();
    if(doc.exists){
        return doc.data();
    } else {
        alert("NO SUCH DOCUMENT ERROR");
    }
}

export async function handleAiData(numberOfAisWanted){
    const data = await getData("STATIC","STATIC")
    const AIS = [];

    while(AIS.length !== numberOfAisWanted){
        const AI = {
            name: data.Nimet[Math.floor(Math.random() * data.Nimet.length)],
            personality: data.Persoonat[Math.floor(Math.random() * data.Persoonat.length)]
        }
        var duplicate = false;
        for(var i=0; i<AIS.length; i++){
            if(AIS[i].name == AI.name){
                duplicate = true;
            }
        }
        if(!duplicate){
            AIS.push(AI)
        }
    }
    return AIS;
}

export async function setData(collection,id,data){
    await setDoc(doc(db, collection, id), data);
    return true
}