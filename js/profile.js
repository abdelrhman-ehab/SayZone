// ////////////////////////////////// variables /////////////////////////////////////
let urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get("userId");


/////////////////////////////////////// update profile /////////////////////////////////
let updateUsernameInput = document.getElementById('Uusername');
let updatePasswordInput = document.getElementById('Upassword');
async function updateProfile() {
    try {
        let response = await axios.put(`${baseURL}updatePorfile`, {
            "username": `${document.getElementById('Uusername').value}`,
            "password": `${document.getElementById('Upassword').value}`
        },
            {
                headers:
                {
                    'authorization': `Bearer ${JSON.parse(localStorage.getItem('linklyToken'))}`
                }
            }
        )
        console.log(response);
        toastr['success']('Username And Password Have Updated Successfully')
    }
    catch (e) {
        toastr['error'](`${e.response.data.message}`)
    }
}

document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'UpdateBtn') {
        await updateProfile();
        const updateModal = document.getElementById('UpdateProfileModal');
        let modalInstance = bootstrap.Modal.getInstance(updateModal);
        modalInstance.hide();
    }
})

//////////////////////////////////// get user info ///////////////////////////////////////
async function getUserInfo() {
    let response = await axios.get(`https://tarmeezacademy.com/api/v1/users/${userId}`)
    let currentUser = response.data.data;

    let profile_image = currentUser.profile_image;

    if (typeof (profile_image) == 'object') {
        profile_image = `https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png`
    }


    let cartona;
    if (userId == loginedUser.id) {
        cartona =
            `
            <div id="profile" class="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-4 mb-3">
                <div id="profileImage">
                    <img loading="lazy" src="${profile_image}" alt="">
                </div>
                <div id="userInfo" class="d-flex flex-column gap-2 w-100">
                    <div class="userName d-flex gap-1">
                        <spa class="fw-bold">name: </spa>
                        <span>${currentUser.name}</span>
                    </div>
                    <div class="name d-flex gap-1">
                        <span class="fw-bold">username: </span>
                        <span>${currentUser.username}</span>
                    </div>
                    <div class="email d-flex gap-1">
                        <span class="fw-bold">Email: </span>
                        <span>${currentUser.email}</span>
                    </div>
                </div>
                <div id="userStatics" class="d-flex flex-column gap-2 w-100">
                    <div class="postsCount">
                        <span class="fw-bold">Posts: </span>
                        <span>${currentUser.posts_count}</span>
                    </div>
                    <div class="userName">
                        <span class="fw-bold">Comments:</span>
                        <span>${currentUser.comments_count}</span>
                    </div>
                </div>
            </div>
            <button class="btn btn-success w-100" data-bs-toggle="modal" data-bs-target="#UpdateProfileModal">Update Profile</button>
        `
    }
    else {
        cartona =
            `
            <div id="profile" class="d-flex flex-column flex-md-row align-items-center gap-3 gap-md-4 mb-3">
                <div id="profileImage">
                    <img loading="lazy" src="${profile_image}" alt="">
                </div>
                <div id="userInfo" class="d-flex flex-column gap-2 w-100">
                    <div class="name">
                        <span class="fw-bold">Name: </span>
                        <span>${currentUser.name}</span>
                    </div>
                </div>
                <div id="userStatics" class="d-flex flex-column gap-2 w-100">
                    <div class="postsCount">
                        <span class="fw-bold">Posts: </span>
                        <span>${currentUser.posts_count}</span>
                    </div>
                    <div class="userName">
                        <span class="fw-bold">Comments:</span>
                        <span>${currentUser.comments_count}</span>
                    </div>
                </div>
            </div>
        `
    }


    document.getElementById('userInfoContainer').innerHTML = cartona;

}
getUserInfo();

////////////////////////////////// get user posts ///////////////////////////////////////
let userPosts;
async function getUserPosts() {
    try {
        let response = await axios.get(`https://tarmeezacademy.com/api/v1/users/${userId}/posts`);
        userPosts = response.data.data;
        userPosts = userPosts.reverse();
        let cartona = ``;


        for (const post of userPosts) {
            let userProfile = post.author.profile_image;
            if (typeof (userProfile) != 'string') {
                userProfile = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';
            }

            let postCover = post.image;
            if (typeof (postCover) != 'string') {
                postCover = 'https://icon-library.com/images/no-picture-available-icon/no-picture-available-icon-1.jpg';
            }
            let shortCaption = post.body.length > 90 ? post.body.substring(0, 90) + "..." : post.body;


            if (userId == loginedUser.id) {
                cartona +=
                    `
                    <div class="post">
                        <div class="postContainer">
                            <div class="postHeader d-flex justify-content-between">
                                <div class="postAuthorDetails d-flex gap-2 align-items-center">
                                    <img loading="lazy" src="${userProfile}" alt="author cover">
                                    <p class="postAuthor">${post.author.name}</p>
                                </div>
                                <div class="postModification d-flex gap-2">  
                                    <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#editPostModal">Edit</button>
                                    <button class="btn btn-danger deletePostBtn">Delete</button>
                                </div>
                            </div>
                            <div class="postCaption">
                                <p class="caption" data-full="${post.body}">${shortCaption}</p>
                                ${post.body.length > 90 ? `<span class="read-more">Read more</span>` : ""}
                            </div>
                            <div class="postCover">
                                <img loading="lazy" src="${postCover}" alt="post cover">
                            </div>
                            <div class="postContent">
                                <p class="date">${post.created_at}</p>
                            </div>
                            <div class="postComments">
                                <i class="fa-solid fa-link"></i>
                                <p class="commentsNum">(${post.comments_count})</p>
                                <p class="comments">comments</p>
                            </div>
                        </div>
                    </div>
                `
            }


            else {
                cartona +=
                    `
                <div class="post">
                    <div class="postContainer">
                        <div class="postHeader d-flex align-items-center gap-2">
                            <img loading="lazy" src="${userProfile}" alt="author cover">
                            <p class="postAuthor">${post.author.name}</p>
                        </div>
                        <div class="postCaption">
                            <p class="caption" data-full="${post.body}">${shortCaption}</p>
                            ${post.body.length > 90 ? `<span class="read-more">Read more</span>` : ""}
                        </div>
                        <div class="postCover">
                            <img loading="lazy" src="${postCover}" alt="post cover">
                        </div>
                        <div class="postContent">
                            <p class="date">${post.created_at}</p>
                        </div>
                        <div class="postComments">
                            <i class="fa-solid fa-link"></i>
                            <p class="commentsNum">(${post.comments_count})</p>
                            <p class="comments">comments</p>
                        </div>
                    </div>
                </div>
                `
            }
        }


        document.getElementById('myPostsContainer').innerHTML = cartona;
        updateUserPosts(userPosts);
        deleteUserPosts(userPosts);
    }
    catch (e) {
        console.log(e.response.data.message);
    }
}
getUserPosts();



// update posts
function updateUserPosts(posts) {
    let postElements = document.querySelectorAll('.post');
    let postsArray = posts;
    let updateButton = document.getElementById('editButton');
    let currentPostId = null;

    // storing id
    postElements.forEach((element, i) => {
        element.addEventListener('click', () => {
            currentPostId = postsArray[i].id;
            let UpdatePostBodyInput = document.getElementById('profilePostBody');
            UpdatePostBodyInput.value = postsArray[i].body;
        });
    });

    // update post
    updateButton.addEventListener('click', async () => {
        try {
            updateButton.disabled = true;
            let UpdatePostBodyInput = document.getElementById('profilePostBody');
            let response = await axios.put(`${baseURL}posts/${currentPostId}`,
                {
                    "body": `${UpdatePostBodyInput.value}`
                },
                {
                    headers:
                    {
                        'authorization': `Bearer ${JSON.parse(localStorage.getItem('linklyToken'))}`
                    }
                }
            )
            await getUserPosts();

            let updateModal = document.getElementById('editPostModal')
            let modalInstance = bootstrap.Modal.getInstance(updateModal);
            modalInstance.hide();
        }
        catch (e) {
            toastr['error'](`${e.response.data.message} please try again`);
        }
        finally {
            updateButton.disabled = false;
        }
    });

}


// delete posts

function deleteUserPosts(posts) {
    let deleteBtns = document.querySelectorAll('.deletePostBtn');
    let postsArray = posts;
    deleteBtns.forEach((deleteBtn, i) => {
        deleteBtn.addEventListener('click', async () => {
            try{
                let response = await axios.delete(`${baseURL}posts/${postsArray[i].id}`, {
                    headers:
                    {
                        'authorization': `Bearer ${JSON.parse(localStorage.getItem('linklyToken'))}`
                    }
                })
                toastr['success']('post deleted successfully')
                await getUserPosts();
            }
            catch(e){
                toastr['error'](`${e.response.data.message} please try again`)
            }
        })
    });
}
