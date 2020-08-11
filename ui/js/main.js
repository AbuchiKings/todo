const baseURL = `${window.location.origin}/api/v1`;
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const btnDiv = document.querySelector('div.btn-div');
const taskForm = document.querySelector('.task-form');
const tbody = document.querySelector('.tbody');
const failure = document.querySelector('.failure');
const success = document.querySelector('.success');
const logoutBtn = document.querySelector('.btn-logout');
const previous = document.querySelector('#prev');
const nxt = document.querySelector('#nxt');
const ul = document.querySelector('.nav ul');
const table = document.querySelector('.table');




/******************************************************** */

/***************functions******************/

const onSuccess = async (res) => {
    if (res.ok) {
        return res.status === 204 ? { status: 204, message: "Deleted successfully!" } : res.json()
            .then(response => {
                console.log(response);
                showMsg(success, `Success: ${response.message}!`)
                return response;
            })
    }
    else {
        if (res.status === 401) {
            localStorage.clear();
            window.location.pathname !== '/index.html' ? window.location.replace('./index.html') : {};
        }
        return Promise.reject(await res.json());
    }
};

const onError = (err) => {
    const { message, error, errors, status } = err;
    showMsg(failure, `${message}!`);
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
    }, 5500);
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
function spinner() {
    const loader = document.querySelector('.loader-div');
    loader.classList.toggle('over-spinner');
}
/*************************requests***/

async function login(event) {
    try {
        event.preventDefault();
        spinner();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const userData = { email, password };
        const loginPath = `${baseURL}/login`;
        const response = await requestHandler('POST', loginPath, userData);
        loginForm.email.value = loginForm.password.value = '';
        if (response && response.data) {
            const { token } = response.data;
            window.localStorage.setItem('token', token);
            const { message } = response;
            window.location.replace('./lists.html');
        }
        spinner();
        return;
    } catch (error) {
        spinner()
        console.log(error);
        return;
    }

};

async function signup(event) {
    try {
        event.preventDefault();
        spinner();
        const fullname = signupForm.fullname.value;
        const email = signupForm.email.value;
        const password = signupForm.password.value;
        const confirmPassword = signupForm.confirmPassword.value;
        const signupData = { fullname, email, password, confirmPassword };
        const signupPath = `${baseURL}/register`;
        const msg = document.querySelector('.errors');
        const response = await requestHandler('POST', signupPath, signupData)
        if (response && response.data) {
            window.location.replace('./index.html');
        }
        spinner();
        return;
    } catch (error) {
        spinner()
        console.log(error);
        return;
    }
};


async function addTask(data) {
    try {
        let flag = isEmpty(data);
        if (taskForm.task.dataset.task) {
            return showMsg(failure, 'Task already exists');
        }
        if (flag) {
            spinner();
            const url = `${baseURL}/tasks`;
            const response = await requestHandler('POST', url, data);
            if (response && response.data) {
                if (tbody.childElementCount < 10) {
                    updateDisplay(response.data);
                } else if (tbody.childElementCount >= 10) {
                    nxt.classList.remove('none');
                }
                spinner();
            }
        } else {
            const msg = 'Provide data!'
            showMsg(failure, msg);
        }
        return;
    } catch (error) {
        spinner();
        console.log(error);
        return;
    }


}


async function loadTasks(page = null) {
    try {
        spinner();
        page = page || table.dataset.page;
        const url = `${baseURL}/tasks?page=${page}`;
        const msg = document.querySelector('.errors');
        const response = await requestHandler('GET', url);
        if (response && response.data) {
            const { previousTasks, nextTasks } = response.data.pagination;
            previousTasks === true ? previous.classList.remove('none') : previous.classList.add('none');
            nextTasks === true ? nxt.classList.remove('none') : nxt.classList.add('none');
            displayItems(response.data.tasks)
            spinner();
            return response.data;
        }
        spinner()
        return;
    } catch (error) {
        spinner()
        console.log(error);
        return;
    }
}


async function update() {
    try {
        console.log(tbody.childElementCount);
        let data = { task: taskForm.task.value };
        let flag = isEmpty(data);
        if (!taskForm.task.dataset.task) {
            showMsg(failure, 'Error: Cannot update a nonexistent task');
            return
        }
        if (flag) {
            spinner()
            taskForm.task.value = '';
            const url = `${baseURL}/tasks/${taskForm.task.dataset.task}`;
            const response = await requestHandler('PATCH', url, data);
            if (response.data) {
                let row = document.getElementById(`${taskForm.task.dataset.task}`)
                row.textContent = response.data.task;
                taskForm.task.dataset.task = ''
                spinner();
            }
        } else {
            const msg = 'Provide data!'
            showMsg(failure, msg);
        }
        return;
    } catch (error) {
        spinner()
        console.log(error)
        return;
    }

}

async function deleteItem(task, id) {
    try {
        if (window.confirm('Item will be permannently deleted from database')) {
            spinner()
            const url = `${baseURL}/tasks/${id}`;
            const response = await requestHandler('DELETE', url);
            if (response.status === 204) {
                tbody.removeChild(task);
                showMsg(success, `Success: ${response.message}`);
            }
            spinner();
        }

        return;
    } catch (error) {
        spinner()
        console.log(error);
        return;
    }

}

async function deleteAllItems() {
    try {
        if (window.confirm('All items will be permannently deleted from database')) {
            spinner()
            const url = `${baseURL}/tasks`;
            const msg = document.querySelector('.errors');
            const response = await requestHandler('DELETE', url);
            if (response.status === 204) {
                while (tbody.firstChild) {
                    tbody.removeChild(tbody.firstChild)
                }
                showMsg(success, `Success: Deleted successfully!`);
            }
            spinner();
        }
        return;
    } catch (error) {
        spinner()
        console.log(error);
        return;
    }
}

async function logout() {
    try {
        spinner()
        const url = `${baseURL}/logout`;
        const response = await requestHandler('GET', url);
        if (response && response.data) {
            localStorage.clear();
            spinner();
            window.location.pathname !== '/index.html' ? window.location.replace('./index.html') : {};
        }
        const loader = document.querySelector('.loader-div');
        loader.classList.contains('over-spinner') ? loader.classList.remove('over-spinner') : {};
        return;
    } catch (error) {
        spinner()
        console.log(error);
        return;
    }
}

/***************Event Listeners */
if (signupForm) {
    signupForm.addEventListener('submit', signup);
}
if (loginForm) {
    loginForm.addEventListener('submit', login);
}

if (window.location.pathname === '/lists.html') {
    loadTasks();
    logoutBtn.addEventListener('click', logout);
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
            taskForm.task.focus();


        } else if (e.target.classList.contains('btndelete')) {
            let id = e.target.dataset.id;
            let row = document.getElementById(`tr${id}`);
            return deleteItem(row, id);
        }
        return;
    });

    ul.addEventListener('click', async (e) => {
        event.preventDefault()
        if (e.target.id === 'prev') {
            let page = parseInt(table.dataset.page, 10) - 1;
            page = page <= 0 ? null : page;
            tbody.innerHTML = '';
            let result = await loadTasks(page);
            if (result && page > 0) {
                table.dataset.page = page;
            }
        } else if (e.target.id === 'nxt') {
            let page = parseInt(table.dataset.page, 10) + 1;
            tbody.innerHTML = '';
            let result = await loadTasks(page);
            if (result && page > 0) {
                table.dataset.page = page;
            }
        }
        return;
    })
}