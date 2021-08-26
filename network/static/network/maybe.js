Class PostForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Please write your new post here.'
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A post was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          New Post:
          <textarea value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="submit" />
      </form>
    );
  }
}



ReactDOM.render(
  <PostForm />,
  document.getElementById('new-post')
);


function PostsView(props) {
  const posts = props.posts;
  const listItems = posts.map((post) =>
    <li className="section-container" >{post}</li>
  );
  return (
    <ul>
      {listItems}
    </ul>
  )
}

const posts = ['first post', 'second post', 'third post'];
ReactDOM.render (
  <PostsView posts={posts}/>,
  document.getElementById('posts-list')
);




render() {
  const { error, isLoaded, items } = this.state;
  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item}
          </li>
        ))}
      </ul>
    );
  }
}
