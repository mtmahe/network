document.addEventListener('DOMContentLoaded', function() {

  // Layout buttons
  let user_pk = 0;

  if (document.getElementById('user-profile-link')) {
    user_pk = document.getElementById('user-profile-link').getAttribute('value');
    document.querySelector('#user-profile-link').addEventListener('click', () => load_dashboard('profile', user_pk));
    document.querySelector('#following-link').addEventListener('click', () => load_dashboard('following', user_pk));
  }


  load_dashboard('all_posts', user_pk);
});

function load_dashboard(posts_type, user_pk) {
  const csrftoken = getCookie('csrftoken');
  // posts type is 'all', 'follow' or pk of chosen user's profile.
  // user pk is logged in user's pk or zero.

  // Log posts name
  let title = return_title(posts_type);
  //console.log(`title ${title}`)

  // Show the dashboard and hide the others
  if (title == 'All posts') {
    document.querySelector('#new-post-view').style.display = 'block';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
  } else if (title == 'Profile') {
    document.querySelector('#new-post-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'block';
    createProfileView(posts_type, user_pk);
  } else if (title == 'Following') {
    document.querySelector('#new-post-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
  }


  // Show the dashboard name
  document.querySelector('#title').innerHTML = `<h3>${title}</h3>`;

  // Create the new post view
  document.querySelector('#new-post-body').value = '';

  // Submit new post
  document.querySelector('#new-post-form').onsubmit = () => {
    console.log('submitting');
    fetch('/posts/compose', {
      headers: {'X-CSRFToken': csrftoken},
      method: 'POST',
      mode: 'same-origin', // Do not send CSRF token to another domain.
      body: JSON.stringify({
        body: document.querySelector('#new-post-body').value,
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(`result ${result.message}`);
      load_dashboard('all_posts');
    })

    return false;
  }


  function createProfileView(posts_type, user_pk) {
    // looking for int so convert posts_type if necessary
    if (posts_type == 'profile' || posts_type == 'following') {
      posts_type = user_pk;
    }
    // Follows Count
    fetch(`/profile/follows/${posts_type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authors': posts_type,
      },
    })
    .then(response => response.json())
    .then(result => {
      followsList = [];
      followsList = result.following_list;
      document.getElementById('follower-count').innerHTML = `Following ${followsList.length}`;
    })
    // Following count
    fetch(`/profile/followers/${posts_type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authors': posts_type,
      },
    })
    .then(response => response.json())
    .then(result => {
      let followingList = [];
      //console.log(`result is ${result.following_total}, length is ${followingList.length}`);
      followingList = result.following_total;
      //console.log(`follow list updated to ${followingList}, length is ${followingList.length}`);
      document.getElementById('following-count').innerHTML = `Followers ${followingList.length}`;

      // Follow button
      // check if profile is current users, then they don't see follow button.
      if (posts_type != user_pk && user_pk != 0) {
        document.querySelector('#follow-button').style.display = 'block';

        // check if user is currently following profile owner and set button content.
        if (followingList == user_pk || followingList.includes(user_pk)) {
          document.getElementById('follow-button').innerHTML = 'Unfollow';
        };

        // event listener for follow button.
        let wasFollowing = true;
        if (document.getElementById('follow-button').innerHTML == 'Follow') {
          wasFollowing = false;
        };
        document.querySelector('#follow-button').addEventListener('click', () => followClick(posts_type, followingList.length, wasFollowing, csrftoken));
      } else {
        document.querySelector('#follow-button').style.display = 'none';
      };
    })
  };

  createPostsView('1', posts_type);

  //  Create the posts view
  function createPostsView(currentPageNumber, posts_type) {
    if (posts_type == 'profile') {
      posts_type = user_pk;
    }
    //console.log(`posts type is ${posts_type}`)
    fetch('/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authors': posts_type,
      },
    })
    .then(response => response.json())
    .then(my_pages => {
      // First, clear posts if there are any.
      const element = document.getElementById('paginate-posts');
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      };
      const currentPage = my_pages.pages[currentPageNumber];
      const numPages = my_pages.num_pages;
      const hasNext = currentPage.has_next;
      const hasPrevious = currentPage.has_previous;
      currentPage.page_list.forEach(append_post_node);


      // Create the individual post containers and append to view
      function append_post_node(item) {
        //console.log(item);
        // Select element to update
        const element = document.getElementById('paginate-posts');

        let isEdit = false;

        // create container for each post
        var next_post = document.createElement('div');
        next_post.setAttribute('class',
        'section-container');

        // Add post to container
        const owner = document.createElement('div');
        node = document.createTextNode(item.owner);
        owner.append(node);
        owner.setAttribute('class', 'post-owner-link');
        next_post.appendChild(owner);
        owner.addEventListener('click', function() {
          load_dashboard(item.owner_pk, user_pk)
        })

        let body_div = document.createElement('div');
        let body = document.createElement('p');
        node = document.createTextNode(item.body);
        body.append(node)
        body_div.appendChild(body);
        next_post.appendChild(body_div);

        const timestamp = document.createElement('small');
        node = document.createTextNode(item.timestamp);
        timestamp.append(node)
        next_post.appendChild(timestamp);

        let likes_div = document.createElement('div');
        let likes = document.createElement('p');
        let img = document.createElement('img');
        img.src = '/static/network/white_heart.png';
        img.setAttribute('class', 'icon');
        likes_div.setAttribute('class', 'likes-div');
        likes_div.appendChild(img);
        likes_div.appendChild(likes);

        //keep likes updated
        likesCount = countLikes(item.id);
        likesCount.then(value => { likes.innerHTML = value; });

        // keep follow icon updated
        likeResponse = isLiked(item.id);
        likeResponse.then(value => { if (value == 'false') {
          img.src = '/static/network/white_heart.png';
        } else {
          img.src = '/static/network/red_heart.png';
        }});

        next_post.appendChild(likes_div);
        img.addEventListener('click', function() {
          likeClick = likeClicked(item.id, likes, csrftoken);
          likeClick.then(value => {
            // keep follow icon updated
            likeResponse = isLiked(item.id);
            likeResponse.then(value => { if (value == 'false') {
              img.src = '/static/network/white_heart.png';
            } else {
              img.src = '/static/network/red_heart.png';
            }});
          })
        });

        // only post owner should see edit button
        if (item.owner_pk == user_pk) {
          const edit = document.createElement('button');
          edit.innerHTML = 'Edit';
          next_post.appendChild(edit);
          edit.addEventListener('click', function() {

            // remove body and replace with edit form
            console.log('edit was clicked');
            body_div.removeChild(body);

            let editForm = document.createElement('form');
            editForm.setAttribute('id', 'edit-form');

            let editBody = document.createElement('textarea');
            editBody.setAttribute('class', 'form-control');
            editBody.setAttribute('id', 'edit-post-body');
            editBody.rows = "2";
            editBody.cols = "40";
            editBody.value = item.body;

            let editButton = document.createElement('input');
            editButton.type = "submit";
            editButton.value = "Post";
            editButton.setAttribute('class', 'btn btn-primary');

            editForm.appendChild(editBody);
            editForm.appendChild(editButton);
            body_div.appendChild(editForm);

            // Submit edit post
            document.querySelector('#edit-form').onsubmit = () => {
              console.log('submitting');
              let newBody = document.querySelector('#edit-post-body').value;
              fetch('/posts/edit', {
                method: 'POST',
                headers: {
                  'X-CSRFToken': csrftoken,
                  'Content-Type': 'application/json',
                  'post-id': item.id,
                },
                mode: 'same-origin', // Do not send CSRF token to another domain.
                body: JSON.stringify({
                  body: document.querySelector('#edit-post-body').value,
                })
              })
              .then(response => response.json())
              .then(result => {
                console.log(`result ${result.message}`);
                //load_dashboard('all_posts');
              })

              // Now remove text area and put back the new body
              body_div.removeChild(editForm);

              let body = document.createElement('p');
              node = document.createTextNode(newBody);
              body.append(node)
              body_div.appendChild(body);

              return false;
            }
          })
        };

        element.appendChild(next_post);
      }

      // Set pagination middle value.
      document.querySelector('#btn-current').innerHTML = 'page ' + currentPageNumber + ' of ' + numPages;
      leftButton.currentPageNumber = currentPageNumber;
      rightButton.currentPageNumber = currentPageNumber;

      // make page buttons dissapear if not applicable.
      if (hasNext) {
        document.querySelector('#btn-next').style.display = 'block';
      } else {
        document.querySelector('#btn-next').style.display = 'none';
      };
      if (hasPrevious) {
        document.querySelector('#btn-previous').style.display = 'block';
      } else {
        document.querySelector('#btn-previous').style.display = 'none';
      };
    })
  }

  //let currentPageNumber = document.querySelector('#btn-current').innerHTML;
  //console.log(`After post page number is ${currentPageNumber}`);

  // Create and add pagination nav
  const leftButton = document.querySelector('#btn-previous');
  leftButton.addEventListener('click', pageChange, false);
  leftButton.amount = -1;

  const rightButton = document.querySelector('#btn-next');
  rightButton.addEventListener('click', pageChange, false);
  rightButton.amount = 1;



  function pageChange(evt) {

    //clear element
    const element = document.getElementById('paginate-posts');
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    var currentPageNumber = String(parseInt(evt.currentTarget.currentPageNumber) + evt.currentTarget.amount);

    // load the selected page
    //load_dashboard('all_posts', currentPageNumber);
    createPostsView(currentPageNumber, posts_type);
  }
}


function return_title(name) {
  // Return the title given name.
  if (name != 'all_posts' && name != 'following') {
    name = 'profile';
  };

  const names = {
    all_posts: 'All posts',
    profile: 'Profile',
    following: 'Following',
  };

  return names[name];
}


function followClick(followed, length, wasFollowing, csrftoken) {
  console.log('follow function')
  fetch('/profile/follow', {
    method: 'POST',
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',  // Do not send CSRF token to another
    body: JSON.stringify({
      'followed': followed,
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log({result});
    // Toggle follow button message
    if (document.getElementById('follow-button').innerHTML == 'Follow') {
      document.getElementById('follow-button').innerHTML = 'Unfollow';

      // only toggle length if this is original change, if not go back to original.
      if (!wasFollowing) {
        length++;
      }
      document.getElementById('following-count').innerHTML = `Followers ${length}`;
    } else {
      document.getElementById('follow-button').innerHTML = 'Follow';

      // only toggle length if this is original change, if not go back to original.
      if (wasFollowing) {
        length--;
      };
      document.getElementById('following-count').innerHTML = `Followers ${length}`;
    };
  })
}


async function likeClicked(post_id, likes, csrftoken) {
  console.log('like was clicked');
  // use await so that .then in main function waits.
  await fetch(`/profile/like/${post_id}`, {
    method: 'POST',
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',  // Do not send CSRF token to another
  })
  .then(response => response.json())
  .then(result => {
    console.log(result.message);
    likesCount = countLikes(post_id);
    likesCount.then(value => { likes.innerHTML = value; });
  })
  return true;
}


async function countLikes(itemID) {
  let likes = 0;
  // Likes count
  let response = await fetch(`/profile/like_count/${itemID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    let json = await response.json();
    likes = json["total_likes"];
  } else {
    alert("HTTP-Error: " + response.status);
    console.log(response.status)
  };
  return likes;
}


function getCookie(name) {
  // csrf token
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


async function isLiked(liked_id) {
  // check if current user is already following
  let isLiked = false;
  let response = await fetch(`/profile/isLiked/${liked_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    let json = await response.json();
    isLiked = json["liked"];
  } else {
    alert("HTTP-Error: " + response.status);
    console.log(response.status)
  };

  return isLiked;
}
