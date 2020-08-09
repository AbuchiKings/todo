//const baseURL = `${window.location.origin}/api/v1`;
const baseURL = `http://localhost:5000/api/v1`;
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const btnDiv = document.querySelector('div.btn-div');
const taskForm = document.querySelector('.task-form');
const tbody = document.querySelector('.tbody');



/******************************************************** */

/***************functions******************/

const onSuccess = async (res) => {
    if (res.ok) {
        console.log(res)
        return res.status === 204 ? { status: 204, message: "Deleted successfully!" } : res.json()
            .then(response => {
                console.log(response);
                return response;
            })
    }
    else {

        return Promise.reject(await res.json());
    }

};

const onError = (err) => {
    const { message, error, errors } = err;
    if (err.statusCode === 401) {
        localStorage.clear();
        window.location.replace('./index.html');
    }
    console.log(err);
    return ({ error, message, errors });
};

const requestHandler = (method = 'GET', url, body = undefined) => {
    const token = localStorage.getItem('token');
    const headers = new Headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const options = {
        method,
        mode: 'cors',
        headers,
        body: JSON.stringify(body)
    }

    const request = new Request(url, options)
    console.log(request);
    return fetch(request)
        .then(onSuccess)
        .catch(onError);
};

function displayItems(items) {
    if (items && items.length > 0) {
        // document.querySelector('#no-item').classList.add('no-item');
        items.forEach(item => {
            updateDisplay(item);
        })
    }
    return;
}

function updateDisplay(item) {
    if (item) {
        let tr = document.createElement('tr');
        tr.className = 'data-row';
        tr.setAttribute('id', `tr${item._id}`);
        let row = `
        <tr class="data-row" data-id=${item._id}>
        <td class="data task" data-title="Task" id=${item._id}>${item.task}</td>
        <td class="data util" data-btn><i class=" fa fa-edit btnedit" data-id=${item._id}></i> </td>
        <td class="data util" data-btn><i class=" fa fa-trash btndelete" data-id=${item._id}></i></td>
    `
        tr.innerHTML = row;
        tbody.appendChild(tr);
    }
}

function showMsg(element, msg) {
    element.textContent = msg;
    element.classList.add('slide');
    window.setTimeout(() => {
        if (element.classList.contains('slide')) {
            element.classList.remove('slide')
        }
    }, 3500);
}

function isEmpty(object) {
    let flag = false;
    if (object.task) {
        flag = true;
    } else {
        flag = false;

    }

    return flag;
}
/*************************requests***/

async function login(event) {
    try {
        event.preventDefault();
        console.log('here')
        // // spinner();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const userData = { email, password };
        const loginPath = `${baseURL}/login`;
        const response = await requestHandler('POST', loginPath, userData);
        const { token } = response.data;
        window.localStorage.setItem('token', token);
        console.log(response.status);
        console.log(response.message);
        if (response.data === undefined) {
            //errorHandler(response);
            // // spinner();
            return;
        }
        const { message } = response;
        // // spinner();
        window.location.replace('./lists.html');
        return;
    } catch (error) {
        // // spinner();
        console.log(error);
    }

};

async function signup(event) {
    try {
        event.preventDefault();
        // spinner();
        const fullname = signupForm.fullname.value;
        const email = signupForm.email.value;
        const password = signupForm.password.value;
        const confirmPassword = signupForm.confirmPassword.value;
        const signupData = { fullname, email, password, confirmPassword };
        const signupPath = `${baseURL}/register`;
        const msg = document.querySelector('.errors');
        const response = await requestHandler('POST', signupPath, signupData)
        console.log(response.status);
        console.log(response.message);
        if (response.data === undefined) {
            // errorHandler(response);
            // spinner();
            return;
        }
        // spinner();
        window.location.replace('./index.html');
        return;
    } catch (error) {
        // spinner();
        console.log(error);
    }
};


async function addTask(data) {
    try {
        let flag = isEmpty(data);
        if (taskForm.task.dataset.task) { return }
        if (flag) {
            const url = `${baseURL}/tasks`;
            const msg = document.querySelector('.errors');
            const response = await requestHandler('POST', url, data);
            updateDisplay(response.data)
            console.log(response.status);
            console.log(response.message);
        } else {
            const el = document.querySelector('.failure');
            const msg = 'Provide data!'
            //showMsg(el, msg);
            console.log('Provide Data')
        }
        return;
    } catch (error) {

    }


}


async function loadTasks() {
    try {
        const url = `${baseURL}/tasks`;
        const msg = document.querySelector('.errors');
        const response = await requestHandler('GET', url);
        console.log('loading...')
        displayItems(response.data)
        console.log(response.status);
        console.log(response.message);
    } catch (error) {
        console.log(error);
    }
}


async function update() {
    try {
        let data = { task: taskForm.task.value };
        let flag = isEmpty(data);
        if (!taskForm.task.dataset.task) { return }
        if (flag) {
            taskForm.task.value = '';
            const url = `${baseURL}/tasks/${taskForm.task.dataset.task}`;
            const msg = document.querySelector('.errors');
            const response = await requestHandler('PATCH', url, data);
            if (response.data) {
                let row = document.getElementById(`${taskForm.task.dataset.task}`)
                row.textContent = response.data.task;
                taskForm.task.dataset.task = ''
                console.log(response.status);
                console.log(response.message);
            }
        } else {
            const el = document.querySelector('.failure');
            const msg = 'Provide data!'
            //showMsg(el, msg);
            console.log('Provide Data')
        }
        return;
    } catch (error) {
        console.log(error)
        return;
    }

}

async function deleteItem(task, id) {
    if (window.confirm('Item will be permannently deleted from database')) {
        const url = `${baseURL}/tasks/${id}`;
        const msg = document.querySelector('.errors');
        const response = await requestHandler('DELETE', url);
        if (response.status === 204) {
            tbody.removeChild(task)
            console.log(response.status);
            console.log(response.message);
        }
    }

}

async function deleteAllItems() {
    if (window.confirm('All items will be permannently deleted from database')) {
        const url = `${baseURL}/tasks`;
        const msg = document.querySelector('.errors');
        const response = await requestHandler('DELETE', url);
        console.log(response.status);
        console.log(response.message);
        if (response.status === 204) {
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild)
            }
        }
    }


}

/***************Event Listeners */
if (signupForm) {
    signupForm.addEventListener('submit', signup);
}
if (loginForm) {
    loginForm.addEventListener('submit', login);
}

if (window.location.pathname === '/ui/lists.html') {
    loadTasks();
}

if (taskForm) {
    btnDiv.addEventListener('click', async (e) => {

        if (e.target.id === 'btn-create') {
            let data = { task: taskForm.task.value };
            taskForm.task.value = ''
            return addTask(data);

        } else if (e.target.id === 'btn-update') {
            return update();

        } else if (e.target.id === 'btn-delete') {
            return deleteAllItems()
        }
        return;
    });
}

if (tbody) {
    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btnedit')) {
            let id = e.target.dataset.id;
            let row = document.getElementById(`${id}`);
            taskForm.task.value = row.textContent;
            taskForm.task.dataset.task = id;

        } else if (e.target.classList.contains('btndelete')) {
            let id = e.target.dataset.id;
            let row = document.getElementById(`tr${id}`);
            console.log(row);
            return deleteItem(row, id);
        }
        return;
    });
}