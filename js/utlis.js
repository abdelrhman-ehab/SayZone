/////////////////////////////////////// toaster ///////////////////////////////////////
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}


// variables
const baseURL = 'https://tarmeezacademy.com/api/v1/';
let loginedUser = JSON.parse(localStorage.getItem('linklyUser'));
if (!loginedUser) {
    loginedUser = {}
}
let registerBtn = document.querySelector('#registerBtn');
let Rname = document.getElementById('Rname');
let RuserName = document.getElementById('Rusername');
let Remail = document.getElementById('Remail');
let Rpassword = document.getElementById('Rpassword');
let RuserImage = document.getElementById('userImage');
const loginBtn = document.querySelector('#loginBtn');
const homeLogout = document.getElementById('homeLogout');
let LuserName = document.getElementById('Lusername');
let Lpassword = document.getElementById('Lpassword');


/////////////////////////////////////// get posts function ///////////////////////////////////////
let posts;
let allPosts = [];
async function getPostsFn(page = 1) {
    try {

        let response = await axios.get(`${baseURL}posts?limit=15&page=${page}`);
        posts = response.data.data;
        
        // get data pages count
        

        allPosts = [...allPosts, ...posts]

        renderPosts(posts);
        attachPostDetailsEvents(allPosts);
        attachUserDetailsEvents(allPosts);

    }
    catch (e) {
        console.log(e);
        toastr["error"](e.message);
    }
}


//////////////////////////////////// show posts ///////////////////////////////////////
function renderPosts(posts){
    if(posts.length>0){
        document.querySelector('.spinnerContainer').classList.replace('d-flex', 'd-none')
    }
    let cartona = ``;
    for(const post of posts){
        let userCover = post.author.profile_image;
        if (typeof (userCover) === 'object') {
            userCover = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'
        }

        let postCover = post.image;
        if (typeof (postCover) === 'object') {
            postCover = 'https://icon-library.com/images/no-picture-available-icon/no-picture-available-icon-1.jpg'
        }

        let shortCaption = post.body.length > 90 ? post.body.substring(0, 90) + "..." : post.body;

        cartona += `
        <div class="post">
            <div class="postContainer">
            <div class="postHeader">
                <img loading="lazy" src="${userCover}" alt="author cover">
                <p class="postAuthor">${post.author.name}</p>
            </div>
            <div class="postCaption">
                <p class="caption" data-full="${post.body}">${shortCaption}</p>
                ${post.body.length > 90 ? `<span class="read-more">Read more</span>` : ""}
            </div>
            <div class="mainPostCover">
                <img loading="lazy" src="${postCover}" alt="post cover">
            </div>
            <div class="postContent">
                <p class="date">${post.created_at}</p>
            </div>
            <div class="postComments">
                <i class="fa-solid fa-link"></i>
                <p class="commentsNum">(${post.comments_count})</p>
                <p class="comments d-flex gap-2 align-items-center">
                comments
                <span id="postTagsContainer${post.id}"></span>
                </p>
            </div>
            </div>
        </div>
        `;
    }
    if (document.getElementById('postsContainer')) {
        document.getElementById('postsContainer').innerHTML += cartona;
    }
}




/////////////////////////////////////// register function  ///////////////////////////////////////
registerBtn.addEventListener('click', async () => {
    let userFormData = new FormData();
    userFormData.append('name', Rname.value);
    userFormData.append('username', RuserName.value);
    userFormData.append('email', Remail.value);
    userFormData.append('password', Rpassword.value);
    userFormData.append('image', RuserImage.files[0]);
    registerBtn.disabled = true;
    try {
        if (Rname.value === '' || RuserName.value === '' || Remail.value === '' || Rpassword.value === '') {
            toastr["error"](`Please Fill All Filds And Try Again`)
            return;
        }
        else {
            let response = await axios.post(`${baseURL}register`, userFormData)
            console.log(response.data);

            // close modal
            const registerModal = document.getElementById('registerModal');
            const instanceRegisterModal = bootstrap.Modal.getInstance(registerModal);
            instanceRegisterModal.hide();

            // empty filds
            Rname.value = '';
            RuserName.value = '';
            Remail.value = '';
            Rpassword.value = '';
            RuserImage.value = '';

            toastr["success"](`Registration successful! Welcome aboard!`)
        }
    }
    catch (e) {
        console.log(e.response.data.message);
        toastr["error"](`${e.response.data.message}, Please Try Again`)
    }
    finally {
        registerBtn.disabled = false;
    }
})



/////////////////////////////////////// login function  ///////////////////////////////////////
async function loginFn() {
    loginBtn.disabled = true    
    try {
        let response = await axios.post(`${baseURL}login`, {
            "username": `${LuserName.value}`,
            "password": `${Lpassword.value}`
        })
        localStorage.setItem('linklyToken', JSON.stringify(response.data.token));
        localStorage.setItem('linklyUser', JSON.stringify(response.data.user));

        // close modal
        const loginModal = document.getElementById('loginModal');
        const instanceLoginModal = bootstrap.Modal.getInstance(loginModal);
        instanceLoginModal.hide();

        // set UI
        getProfileInfo();
        setupUI();

        if (document.getElementById('whatInYourMindSection')) {
            document.getElementById('whatInYourMindSection').classList.replace('d-none', 'd-flex')
        }

        if (document.getElementById('addingCommentContainer')) {
            document.getElementById('addingCommentContainer').classList.replace('d-none', 'd-flex')
        }

        document.getElementById('profileLink').classList.add('d-block');


        window.location.href = window.location.href;

        // empty filds
        LuserName.value = '';
        Lpassword.value = '';

        toastr['success']('Login successful. Welcome back.')


        await getPostsFn();

        return true;
    }
    catch (e) {
        console.log(e);
        toastr["error"](`${e.response.data.message}, Please Try Again`)
    }
    finally {
        loginBtn.disabled = false
    }
}

loginBtn.addEventListener('click', () => {
    loginFn();
})




/////////////////////////////////////// logout function  ///////////////////////////////////////
async function logoutFn() {
    localStorage.removeItem('linklyToken');
    localStorage.removeItem('linklyUser');

    // handle ui
    setupUI();
    getProfileInfo();
    if (document.getElementById('whatInYourMindSection')) {
        document.getElementById('whatInYourMindSection').classList.replace('d-flex', 'd-none')
    }

    if (document.getElementById('addingCommentContainer')) {
        document.getElementById('addingCommentContainer').classList.replace('d-flex', 'd-none')
    }

    if(document.getElementById('userInfoContainer')){
        document.getElementById('userInfoContainer').innerHTML = `<p>Login To See User Dashboard</p>`;
    }

    if(document.getElementById('myPostsContainer')){
        document.getElementById('myPostsContainer').innerHTML = `<p>Login To See User Posts</p>`;
    }

    document.getElementById('profileLink').classList.add('d-none');


    toastr['success']('You have been logged out successfully.');
    await getPostsFn();
    return true;
}

homeLogout.addEventListener('click', () => {
    logoutFn();
})



/////////////////////////////////////// get user ///////////////////////////////////////
function getUser() {
    let user = null;
    if (localStorage.getItem('linklyUser') != null) {
        user = JSON.parse(localStorage.getItem('linklyUser'))
    }
    return user
}


/////////////////////////////////////// get profile info ///////////////////////////////////////
function getProfileInfo() {
    if (localStorage.getItem('linklyUser') != null) {
        const user = getUser();
        let userImage = user.profile_image;
        if (typeof (userImage) === 'object') {
            userImage = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'
        }
        const profileImage = document.getElementById('profileImage');
        const profileName = document.getElementById('profileName');

        if (profileImage && profileName != null) {
            profileImage.setAttribute('src', `${userImage}`);
            profileName.innerText = user.name;
        }
    }
}
getProfileInfo();



/////////////////////////////////////// handle UI function ///////////////////////////////////////
function setupUI() {
    const token = localStorage.getItem('linklyToken');
    const homeLogin = document.getElementById('homeLogin');
    const homeRegister = document.getElementById('homeRegister');
    const homeLogout = document.getElementById('homeLogout');
    const homeAddPostBtn = document.getElementById('whatInYourMind');
    const profileImage = document.getElementById('profileImage');
    const profileName = document.getElementById('profileName');
    if (token === null)    //no user yet (guest)
    {
        if (homeAddPostBtn && profileImage && profileName != null) {
            homeAddPostBtn.style.display = 'none';
            profileImage.style.display = 'none';
            profileName.style.display = 'none';
        }
        homeLogin.style.display = 'block';
        homeRegister.style.display = 'block';
        homeLogout.style.display = 'none';
        document.getElementById('profileLink').classList.add('d-none');
    }
    else {       //already user found
        if (homeAddPostBtn && profileImage && profileName != null) {
            homeAddPostBtn.style.display = 'flex';
            profileImage.style.display = 'block';
            profileName.style.display = 'block';
        }
        homeLogin.style.display = 'none';
        homeRegister.style.display = 'none';
        homeLogout.style.display = 'flex';
        document.getElementById('profileLink').classList.add('d-block');
    }
}
setupUI();


// go to profile page
let profileLink = document.getElementById('profileLink');
profileLink.addEventListener('click', () => {
    profileLink.href = `profile.html?userId=${loginedUser.id}`
})



// read more
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("read-more")) {
        e.stopPropagation();
        e.preventDefault();

        let caption = e.target.previousElementSibling;
        let fullText = caption.getAttribute("data-full");

        if (e.target.innerText === "Read more") {
            caption.innerText = fullText;
            e.target.innerText = "Read less";
        } else {
            caption.innerText = fullText.substring(0, 90) + "...";
            e.target.innerText = "Read more";
        }
    }
});


