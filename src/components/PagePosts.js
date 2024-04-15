import React, { useEffect,useState }  from "react";
import { Link,useParams,useNavigate,useLocation } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import PageMenu from "./PageMenu";
import PostModal from "./PostModal";

const SinglePost = props => {
  const post = props.post;

  return(
    <li post_id={post.id}>
      <div className="post-thumbnail clickable" onClick={props.onClick}>
        {
          post.thumbnail_url &&
          <img alt='' src={post.thumbnail_url} className="cover-img"/>
        }
      </div>
      <div className="post-details">
        <h3 className="post-title clickable" onClick={props.onClick}>{post.title}</h3>
        <div className="post-excerpt">
          {post.excerpt}
        </div>
      </div>
    </li>
  )
}

const PagePosts = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const loading = (props.posts === undefined);
  const {featureId} = useParams();
  const [wpPost,setWpPost] = useState();

  const getWpPostById = id => {
    id = parseInt(id);
    return (props.posts || []).find(item => id === item.wp_id);
  }

  useEffect(()=>{
    const wpPost = getWpPostById(featureId);
    setWpPost(wpPost);
  },[featureId])

  const getPageUrl = () => {
    return location.pathname.replace('/'+wpPost?.id, '');
  }

  const handleCloseModal = () => {
    navigate(getPageUrl());
  }

  const getPostUrl = id => {

    //const url = `${getPageUrl()}/${post.id}/${post.slug}`;
    const url = `${getPageUrl()}/${id}`;
    return url;
  };

  const handleClick = featureId => {
    navigate(getPostUrl(featureId));
  }

  return(
    <div id={props.id} className="page posts-page padding-page">
      {
        ( wpPost !== undefined ) &&
        <PostModal
        wpid={wpPost.id}
        title={wpPost.title}
        onClose={handleCloseModal}
        />
      }
        <div className="page-header">
          <h1>{props.title}</h1>
          <PageMenu/>
        </div>
        {

        <>
          {
            loading ?
            <Loader active />
            :
            <ul className="page-content posts-list">
              {
                //TOUFIX URGENT HANDLE NO POSTS
                (props.posts || []).map((post,k) => {
                  return(
                    <SinglePost
                    key={k}
                    post={post}
                    onClick={()=>handleClick(post.id)}
                    />
                  )
                })
              }
            </ul>
          }

        </>
        }
    </div>
  )
}

export default PagePosts
