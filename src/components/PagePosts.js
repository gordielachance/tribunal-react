import React, { useEffect,useState }  from "react";
import { Link,useParams,useNavigate,useLocation } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import PageMenu from "./PageMenu";
import WpPostModal from "./WpPostModal";

const PagePosts = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const loading = (props.posts === undefined);
  const {urlPostId} = useParams();
  const [modalPostId,setModalPostId] = useState();

  useEffect(()=>{
    setModalPostId(urlPostId);
  },[urlPostId])

  const handleCloseModal = () => {
    const url = location.pathname.replace('/'+modalPostId, '');
    navigate(url);
  }

  return(
    <div id={props.id} className="page posts-page padding-page">
      {
        ( modalPostId !== undefined ) &&
        <WpPostModal
        postId={modalPostId}
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
                (props.posts || []).map((post,key) => {

                  return(
                    <li post_id={post.id} key={post.id}>
                      <div className="post-thumbnail">
                        {
                          post.thumbnail_url &&
                          <img alt='' src={post.thumbnail_url} className="cover-img"/>
                        }
                      </div>
                      <div className="post-details">
                        <h3 className="post-title">
                          <Link to={post.guid.rendered}>{post.title.rendered}</Link>
                        </h3>
                        <div className="post-excerpt">
                          {post.excerpt.rendered}
                        </div>
                      </div>
                    </li>
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
