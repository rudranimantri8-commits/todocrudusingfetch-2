
const cl = console.log;

const todoform = document.getElementById("todoform");
const todoInput = document.getElementById("todoInput");
const addtodo = document.getElementById("addtodo");
const updatetodo = document.getElementById("updatetodo");
const spinner = document.getElementById("spinner");

let BASE_URL = `https://crud-post-5e4d9-default-rtdb.firebaseio.com`;

function snackBar(msg,icon){
       Swal.fire({
         text:msg,
         icon:icon,
         timer:2000
    })
}

const localState = {
    todoArr : [],
    editId : null
}

function handleSpinner(flag){
    if(flag){
        spinner.classList.remove("d-none");
    }else{
        spinner.classList.add("d-none");
    }
  }

  //Read

  function fetchtodo(){
    const todourl = `${BASE_URL}/todo.json`;
    handleSpinner(true);
    fetch(todourl,{
        body: null,
        headers :{
            "content-type":"application/json",
            "security" : "JWT token"
        },
        method:"GET"
    })
    .then(res=>{
        return res.json();
     })
     .then(data=>{
        for (let key in data) {
            data[key].id = key;
            localState.todoArr.unshift(data[key]);
        }
        createtodos(localState.todoArr);
     })
     .catch(err=>{
        snackBar(`Error while fetching data`,"error")
     })
     .finally(()=>{
        handleSpinner();
     })
  }

  
  function createtodos(arr){
    const todoContainer = document.getElementById("todoContainer");
    let res = "";
    arr.forEach(todo=>{
        res += ` <li class="list-group-item d-flex justify-content-between" id=${todo.id}>
                       <strong> ${todo.todoItem} </strong>
                        <div> 
                              <button onClick ="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                              <button onClick ="onDelete(this)" class="btn btn-sm btn-outline-danger">Delete</button>
                        </div>
                  </li> `
    })
        todoContainer.innerHTML = res;
  }
  fetchtodo();

  //create

  function oncreate(eve){
    const todoContainer = document.getElementById("todoContainer");
    const todourl = `${BASE_URL}/todo.json`;
    const todoInput = document.getElementById("todoInput");
    eve.preventDefault();
    const todoObj = {
        todoItem:todoInput.value
    }
    handleSpinner(true);
     fetch(todourl,{
        body: JSON.stringify(todoObj),
        headers :{
            "content-type":"application/json",
            "security" : "JWT token"
        },
        method:"POST"
    })
    .then(res=>{   
        return res.json()
     })
     .then(data=>{
         todoObj.id = data.name;
            localState.todoArr.unshift(todoObj);
            todoform.reset();

            let newli = document.createElement("li");
            newli.id = todoObj.id;
             newli.className = "list-group-item d-flex justify-content-between";
            newli.innerHTML = `
            <strong>${todoObj.todoItem}</strong>
            <div>
                <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger">Remove</button>
            </div>
        `;
         todoContainer.prepend(newli);
         snackBar(`Todo added successfully`, "success");
     })
     .catch(err=>{
        snackBar(`error while fetching data`,"error");
     })
     .finally(()=>{
        handleSpinner();
     })
  }

  //edit
function onEdit(ele) {
    const editId = ele.closest("li").id;
    localState.editId = editId;
    const editObj = localState.todoArr.find(todo => todo.id === editId);
    todoInput.value = editObj.todoItem;
    addtodo.classList.add("d-none");
    updatetodo.classList.remove("d-none");
}

//update
function updatetodos(ele){
    const udpateId = localState.editId;
    const updateUrl = `${BASE_URL}/todo/${udpateId}.json`;
    const udpatedObj = {
        todoItem: todoInput.value
    }
    handleSpinner(true)
    fetch(updateUrl, {
        method: "PATCH",
        body: JSON.stringify(udpatedObj),
        headers: {
            "Content-type": "application/json",
            "security": "JWT token",
        }
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            udpatedObj.id = udpateId;
            const udpdateIndex = localState.todoArr.findIndex(todo => todo.id === udpateId);
            localState.todoArr[udpdateIndex] = udpatedObj;
            let udpateli = document.getElementById(udpateId);
            udpateli.querySelector("strong").innerText = udpatedObj.todoItem;
            todoform.reset();
            const addtodo = document.getElementById("addtodo");
            addtodo.classList.remove("d-none");
            updatetodo.classList.add("d-none");
            snackBar(`Todo with id : ${udpateId} is updated successfully...`, "success");
        })
        .catch(err => {
            snackBar(`error while updating todo !!!`, "error")
        })
        .finally(() => {
            handleSpinner();
        })
}


//delete
function onDelete(ele) {
    const deleteId = ele.closest("li").id;
    const delelteUrl = `${BASE_URL}/todo/${deleteId}.json`
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            handleSpinner(true)
            fetch(delelteUrl, {
                method: "Delete",
                body: null,
                headers: {
                    "Content-type": "application/json",
                    "security": "JWT token"
                }
            })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    const deleteIndex = localState.todoArr.findIndex(todo => todo.id === deleteId);
                    localState.todoArr.splice(deleteIndex, 1);
                    ele.closest("li").remove();
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your todo has been deleted.",
                        icon: "success"
                    });
                })
                .catch(err => {
                    snackBar(`Todo with id ${deleteId} is removed successfully...`);
                })
                .finally(() => {
                    handleSpinner();
                })

        }
    });
}


todoform.addEventListener("submit", oncreate);
updatetodo.addEventListener("click", updatetodos)
