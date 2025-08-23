// ////////////////////////// variables ///////////////////////////////////////
const urlParams = new URLSearchParams(window.location.search)
const postId = urlParams.get("postId")
const userId = urlParams.get("userId")

console.log(postId, userId);



let currentPost = JSON.parse(localStorage.getItem('postDetails'))
let currentUser = JSON.parse(localStorage.getItem('linklyUser'))

if (!localStorage.getItem('linklyUser')) {
    currentUser = {}
}



// ////////////////////////// show post details ///////////////////////////////////////
async function showPostDetails() {
    try{

        let response = await axios.get(`https://tarmeezacademy.com/api/v1/posts/${postId}`)
        let post = response.data.data;
        let postCover = post.image;
        let postComments = post.comments;
    
    
        // get post comments
    
        let commentsCartona = ``;
        for (const comment of postComments) {
            commentsCartona +=
                `
                <div class="userComment my-3">
                    <div class="userCommentHeder d-flex align-items-center mb-1 gap-2">
                        <img loading="lazy" src="${comment.author.profile_image}" alt="">
                        <p>${comment.author.name}</p>
                    </div>
                    <div class="userCommentbody">
                        <p class="fs-6">${comment.body}</p>
                        <p class="fs-6 text-muted">${comment.author.created_at.split('T')[0]}</p>   
                    </div>
                </div>
                <hr>
            `
        }
    
    
        // get post tags
    
    
        if (typeof (postCover) === 'object') {
            postCover = 'https://icon-library.com/images/no-picture-available-icon/no-picture-available-icon-1.jpg'
        }
    
        let postAuthorImage = post.author.profile_image;
        if (typeof (postAuthorImage) === 'object') {
            postAuthorImage = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'
        }
    
        let shortCaption = post.body.length > 90 ? post.body.substring(0, 90) + "..." : post.body;
    
    
        let cartona =
            `
            <p class="postDetailsAuthor mb-3 fw-medium fs-2">${post.author.name}'s post</p>
            <div class="post">
                <div class="postContainer">
                    <div class="postHeader d-flex justify-content-between">
                        <div class="postAuthorDetails d-flex gap-2 align-items-center">
                            <img loading="lazy" src="${postAuthorImage}" alt="author cover">
                            <p class="postAuthor">@${post.author.username}</p>
                        </div>
                        <div class="postModification d-flex gap-2"> 
                            <button class="btn btn-secondary" id="editBtn">Edit</button>
                            <button class="btn btn-danger" id="deleteBtn">Delete</button>
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
                        <p class="comments d-flex gap-2 align-items-center">
                            comments
                            <span id="postTagsContainer${post.id}">
                                
                            </span>
                        </p>
                    </div>
                    <div class="usersComments">
                        ${commentsCartona}
                    </div>
                </div>
                <div class="addingCommentContainer d-none align-items-center gap-2 mx-2" id="addingCommentContainer">
                    <img loading="lazy" src="${currentUser.profile_image}" alt="author cover">
                    <input type="text" class="form form-control" id="addCommentInput" placeholder="Add Your Comment">
                    <i class="fa-solid fa-paper-plane text-primary" id="sendComment"></i>
                </div>
            </div>
        `  
    
        document.getElementById('postDetails').innerHTML = cartona;
        if (currentUser.id === post.author.id) {
            document.getElementById('editBtn').style.display = 'block';
            document.getElementById('deleteBtn').style.display = 'block';
        }
        else {
            document.getElementById('editBtn').style.display = 'none';
            document.getElementById('deleteBtn').style.display = 'none';
        }
    
    
        // update current post data in local storage
        localStorage.setItem('postDetails', JSON.stringify(post))
    
        // add comment ui
        if (localStorage.getItem('linklyUser')) {
            if(document.getElementById('addingCommentContainer')){
                document.getElementById('addingCommentContainer').classList.replace('d-none', 'd-flex');
            }  
        }
    }
    catch(e){
        console.log(e);
    }

    

}



// ////////////////////////// add comments ///////////////////////////////////////
function bindCommentHandler() {
    document.addEventListener("click", async (e) => {
        if (e.target && e.target.id === "sendComment") {
            try {

                let commentInput = document.getElementById("addCommentInput");

                let params = { body: commentInput.value };
                await axios.post(
                    `https://tarmeezacademy.com/api/v1/posts/${postId}/comments`,
                    params,
                    {
                        headers: {
                            'authorization': `Bearer ${JSON.parse(localStorage.getItem("linklyToken"))}`,
                        },
                    }
                );

                commentInput.value = "";
                await showPostDetails();
            }
            catch (e) {
                toastr["error"](`${e.response.data.message} Please Try Again`)
            }
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
        document.getElementById('sendComment').click();
    }
});


(async function init() {
    await showPostDetails();
    bindCommentHandler(); // only bind once
})();



/////////////////////////////////////// show update modal ///////////////////////////////////////
let caption = document.getElementById('postBody')
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'editBtn') {
        document.getElementById('editBtn').disabled = true;
        try{
            let editModal = new bootstrap.Modal(document.getElementById('editPostModal'), {})
            currentPost = JSON.parse(localStorage.getItem('postDetails'));
            caption.value = currentPost.body;
            editModal.toggle();
        }
        catch(e){
            toastr['error'](`${e} Please Try Again`)
        }
        finally{
            document.getElementById('editBtn').disabled = false;
        }
    }
})



/////////////////////////////////////// update post function///////////////////////////////////////
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'editButton') {
        document.getElementById('editButton').disabled = true;
        try {
            let response = await axios.put(`https://tarmeezacademy.com/api/v1/posts/${postId}`,
                {
                    "body": `${caption.value}`
                },
                {
                    headers:
                    {
                        'authorization': `Bearer ${JSON.parse(localStorage.getItem('linklyToken'))}`
                    }
                }
            );
            toastr['success']('Post Updated Successfully')
            window.location.href = window.location.href;
        }
        catch (e) {
            toastr['error'](e.response.data.message + ' Please Try Again')
        }
        finally{
            document.getElementById('editButton').disabled = false;
        }
    }
})



/////////////////////////////////////// delete post function ///////////////////////////////////////
async function deletePost() {
    try {

        let response = await axios.delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`,
            {
                headers:
                {
                    'authorization': `Bearer ${JSON.parse(localStorage.getItem('linklyToken'))}`
                }
            }
        )

        console.log(response);
        toastr['success']('the post has been deleted successfully');

        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1500)
    }
    catch (e) {
        toastr['erroor'](e.response.data.message + ' please try again')
    }
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'deleteBtn') {
        deletePost();
    }
})
