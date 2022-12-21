import PageMenu from "./PageMenu";

const Page404 = (props) => {

  return(
    <div class="page-container">
      <div id="page404" className="page padding-page">
          <div className="page-header">
            <h1>404</h1>
            <PageMenu/>
          </div>
          <div className="page-content">
          Cette page n'existe pas.
          </div>
      </div>
    </div>
  )
}

export default Page404
