import { Link } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import { useApp } from '../AppContext';
import {getMapUrl} from "./../Constants";
import PageMenu from "./PageMenu";

const PagePosts = (props) => {

  const loading = (props.posts === undefined);

  return(
    <div id={props.id} className="page posts-page padding-page">
      <div className="page-content">
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
            <ul className="posts-list">
              {
                (props.posts || []).map((post,key) => {
                  return(
                    <li post_id={post.id} key={post.id}>
                      <h3 className="post-title">
                        <Link to={getMapUrl(post.id,post.slug)}>{post.title.react}</Link>
                      </h3>
                      <div>
                        {post.excerpt.react}
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
    </div>
  )
}

export default PagePosts
