class PostForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({ body: this.state.value})
    };
    fetch('/posts/compose', requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
    alert('A post was submitted: ' + this.state.value);
    //event.preventDefault();
  }

  render() {
    return (
      <div className="section-container" id="new-post-view">
        <form onSubmit={this.handleSubmit}>
          <h5 id="title">New Post: </h5>
          <textarea
            className="form-control"
            value={this.state.value}
            onChange={this.handleChange}
          />
          <input type="submit" className="btn btn-primary" value="Post" />
        </form>
      </div>
    );
  }
}

ReactDOM.render(
  <PostForm />,
  document.getElementById('new-post')
);


class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      pageList: [],
      pageNumber: 1
    };
  }

  componentDidMount() {
    fetch(`/posts/all/${this.state.pageNumber}`)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          console.log(`page number ${this.state.pageNumber}`);
          this.setState({
            isLoaded: true,
            items: result.pages,
            pageList: result.page_list,
            hasNext: result.has_next,
            hasPrevious: result.has_previous,
            numPages: result.num_pages,
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  handleClick(index) {
    let pageNumber = this.state.pageNumber === index ? this.state.pageNumber : index;
    this.setState({pageNumber});
    console.log(`clicked: ${index}, current is ${this.state.pageNumber}`);
    fetch(`/posts/all/${index}`)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          console.log(`page number ${this.state.pageNumber}`);
          this.setState({
            isLoaded: true,
            items: result.pages,
            pageList: result.page_list,
            hasNext: result.has_next,
            hasPrevious: result.has_previous,
            numPages: result.num_pages,
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, items } = this.state;
    var currentPage = this.state.pageNumber;
    let listPages = [];
    let pageList = this.state.pageList;

    // Show two pages before, two pages after current.
    var j = currentPage;
    if ((j-2) > 0) {
      listPages.push(<li key={j-2} className="page-item"><a className="page-link" onClick={this.handleClick.bind(this, j-2)}>{j-2}</a></li>);
    }
    if ((j-1) > 0) {
      listPages.push(<li key={j-1} className="page-item"><a className="page-link" onClick={this.handleClick.bind(this, j-1)}>{j-1}</a></li>);
    }
    listPages.push(<li key={j} className="page-item active" aria-current="page">
      <span className="page-link">
        {j}
        <span className="sr-only">(current)</span>
      </span>
    </li>);
    if (pageList.includes(j+1)) {
      console.log('next page exists');
      listPages.push(<li key={j+1} className="page-item"><a className="page-link" onClick={this.handleClick.bind(this, j+1)}>{j+1}</a></li>);
    } else {
      console.log(`j ${j} pagelist ${pageList}`)
    }
    if (pageList.includes(j+2)) {
      console.log('next page exists');
      listPages.push(<li key={j+2} className="page-item"><a className="page-link" onClick={this.handleClick.bind(this, j+2)}>{j+2}</a></li>);
    }
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="posts-container">
          <ul>
            {items.map(item => (
              <li className="section-container" key={item.id}>
                <strong>{item.owner}</strong>
                <p>{item.body}</p>
                <small>{item.timestamp}</small>
                <p>likes</p>
              </li>
            ))}
          </ul>
          <nav className="page-nav" aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              {this.state.hasPrevious === true &&
                <li className="page-item">
                  <a className="page-link" onClick={this.handleClick.bind(this, (currentPage -1))} aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
              }
              {listPages}
              {this.state.hasNext === true &&
                <li className="page-item">
                  <a className="page-link" onClick={this.handleClick.bind(this, (currentPage +1))} aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>
      );
    }
  }
}


ReactDOM.render (
  <MyComponent />,
  document.getElementById('posts-list')
);




//function ProfileView(props) {
//  return (
//    <div id="profile-div" className="section-container">
//      <h4>Followers</h4>
//      <p>posts</p>
//      <button type="button" name="button"
//        className="btn btn-secondary" onClick={props.handleFollowClick.bind(this)}>Follow Button</button>
//    </div>
//  )
//}





    function QueryFollows(props) {
      var res = 0;
      console.log(`profile_id is ${props.profile_id}`);
      fetch(`/profile/follows/${props.profile_id}`)
        .then(response => response.json())
        .then(result => {
          console.log(`queryFollows result ${result}`);
          var res = {result};
        })

      //alert('Data was sent');
      event.preventDefault();

      return (
        <p>{result}</p>
      )
    }
