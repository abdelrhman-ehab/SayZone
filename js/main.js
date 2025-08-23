// profile modal
if (loginedUser) {
    document.querySelector('#profileModalImage img').src = loginedUser.profile_image;
    document.querySelector('#profileModalName').textContent = loginedUser.name;
}

(async function init() {
    await getPostsFn();
})();


//////////////////////////////////// get post details ///////////////////////////////////////
function attachPostDetailsEvents(allPosts) {
    let postsElement = document.querySelectorAll('.postContainer');
    postsElement.forEach((element, i) => {
        element.addEventListener('click', (e) => {
            if (e.target.classList.contains("read-more")) {
                return;
            }
            e.stopPropagation();
            localStorage.setItem('postDetails', JSON.stringify(allPosts[i]));
            window.location.href = `postDetails.html?postId=${allPosts[i].id}&userId=${allPosts[i].author.id}`;
        })
    });
}


//////////////////////////////////// get user details ///////////////////////////////////////
function attachUserDetailsEvents(allPosts) {
    let postsElement = document.querySelectorAll('.postHeader');
    postsElement.forEach((element, i) => {
        element.addEventListener('click', (e) => {
            if (e.target.classList.contains("read-more")) {
                return;
            }
            e.stopPropagation();
            window.location.href = `profile.html?userId=${allPosts[i].author.id}`;
            localStorage.setItem('postDetails', JSON.stringify(allPosts[i]));
        })
    });
}






////////////////////////////////// pagination /////////////////////////////////////////////////
let currentPage = 1;
let isLoading = false;     //no lading now
window.addEventListener('scroll', async () => {
    const endOfPage = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;

    if (endOfPage && !isLoading) {
        isLoading = true;    //loading now
        currentPage++;
        await getPostsFn(currentPage);

        // control loading time
        setTimeout(() => {
            isLoading = false
        }, 1000)
    }
});




/////////////////////////////////////// add post function ///////////////////////////////////////
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'addPostButton') {
        document.getElementById('addPostButton').disabled = true;
        try {
            let postBody = document.getElementById('postBody');
            let postImage = document.getElementById('postImage');

            let formData = new FormData();
            formData.append('body', postBody.value);
            formData.append('image', postImage.files[0]);

            let response = await axios.post(`${baseURL}posts`, formData,
                {
                    headers:
                    {
                        "authorization": `Bearer ${JSON.parse(localStorage.getItem('linklyToken'))}`
                    }
                }
            )

            toastr["success"](`Post Added Successfully`)

            // close modal
            const addPostModal = document.getElementById('addPostModal');
            const instanceAddPostModal = bootstrap.Modal.getInstance(addPostModal);
            instanceAddPostModal.hide();

            // display last posts
            window.location.href = window.location.href
        }
        catch (e) {
            console.log(e.response);
            toastr["error"](`${e.response.data.message}, Please Try Again`)
        }
        finally {
            document.getElementById('addPostButton').disabled = false;
        }
    }
})



/////////////////////////////////////// go top page ///////////////////////////////////////
const goUp = document.querySelector('main .fa-angle-up');
window.addEventListener('scroll', () => {
    if (scrollY >= 4000) {
        goUp.style.display = 'flex'
    }
    else {
        goUp.style.display = 'none'
    }
})

goUp.addEventListener('click', () => {
    scroll({
        top: 0,
        behavior: "smooth"
    })
})







