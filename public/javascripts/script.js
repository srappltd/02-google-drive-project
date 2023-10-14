document.querySelectorAll(".a-btn").forEach(elem=>{
    elem.addEventListener("click",()=>{
        document.querySelectorAll(".a-btn").forEach(elems=>{
            elems.classList.remove('active');
        })
        elem.classList.add('active');
    })
});


let flag = 0;
let flag2 = 0;
document.querySelector(".new-btn").addEventListener("click",()=>{
    if(flag == 0){
        document.querySelector("#menu").style.top = "20vh"
        document.querySelector("#menu").style.left = "20px"
        document.querySelector("#menu").style.display = "flex"
        flag = 1;
        flag2 = 0;
    }else{
        document.querySelector("#menu").style.top = "20vh"
        document.querySelector("#menu").style.left = "20px"
        document.querySelector("#menu").style.display = "none"
        flag = 0;
    }
})
document.querySelector(".drives").addEventListener("click",()=>{
    if(flag2 == 0){
        document.querySelector("#menu").style.top = "20vh"
        document.querySelector("#menu").style.left = "35vh"
        document.querySelector("#menu").style.display = "flex"
        flag2 = 1;
        flag = 0;
    }else{
        document.querySelector("#menu").style.top = "20vh"
        document.querySelector("#menu").style.left = "35vh"
        document.querySelector("#menu").style.display = "none"
        flag2 = 0;
    }
})

let newFolder = 0;
document.querySelector('.new-folder').addEventListener('click',()=>{
    if(newFolder == 0){
        document.querySelector("#menu .newfolder").style.display = 'block';
        newFolder = 1;
    }else{
        document.querySelector("#menu .newfolder").style.display = 'none';
        newFolder = 0;
    }
})

function uploadFile(){

    // let fileUp = 0;
    // document.querySelector(".file-upload").addEventListener("click",()=>{
    //     if(fileUp == 0){
    //         document.querySelector("#fileupload").style.display = 'flex';
    //         fileUp = 1;
    //     }else{
    //         document.querySelector("#fileupload").style.display = 'none';
    //         fileUp = 0;
    //     }
    // })

    let fileUpload = document.querySelector(".select-file");
    document.querySelector(".submit-file").addEventListener('click',(e)=>{
        if(fileUpload.value === ""){
            alert('Please select a file')
            e.preventDefault();
        }else{
            // alert("Upload")
        }
    })
}
uploadFile();

document.querySelectorAll(".items").forEach(elem=>{
    let item = 0;
    let form = elem.querySelector('.center-part4-form');
    let updatePen = elem.querySelector('.ri-edit-fill');
    updatePen.addEventListener('click',()=>{
        if(item == 0){
            form.style.display = 'block';
            item = 1;
        }else{
            form.style.display = 'none';
            item = 0;
        }
    })
})
