//redux.aws.cose.isu.edu/testpage
//testpage.js
/**
 * This is the main page for the Redux Application. All active components are children (in the heirarchy) of this parent react component.
 * 
 * 
 */

import React from 'react' //React is implicitly imported
import ProblemRow from '../components/pageblocks/ProblemRow'
import ProblemRowReact from '../components/pageblocks/ProblemRowReact'
import ReduceToRow from '../components/pageblocks/ReduceToRow'
import ReduceToRowReact from '../components/pageblocks/ReduceToRowReact'
import VisualizeRow from '../components/pageblocks/VisualizeRow'
import VisualizeRowReact from '../components/pageblocks/VisualizeRowReact'
import SolveRow from '../components/pageblocks/SolveRow'
import SolveRowReact from '../components/pageblocks/SolveRowReact'
import VerifyRow from '../components/pageblocks/VerifyRow'
import VerifyRowReact from '../components/pageblocks/VerifyRowReact'
import Button from 'react-bootstrap/Button'
import 'bootstrap/dist/css/bootstrap.min.css'
import Image from 'next/image'
import isulogo from '../components/images/ISULogo.png'
import SearchBarProblemType from '../components/widgets/SearchBars/SearchBarProblemType'
import ProblemProvider from '../components/contexts/ProblemProvider'
import ResponsiveAppBar from '../components/widgets/ResponsiveAppBar'
import { Box, createTheme, Grid, ThemeProvider, Typograph } from "@mui/material"
import { Container } from 'react-bootstrap'

//const reduxBaseUrl = 'http://redux.aws.cose.isu.edu:27000/';
const reduxBaseUrl = process.env.NEXT_PUBLIC_REDUX_BASE_URL; //redux url. Note the trailing slash
/**
 * Generates the actual page contents
 * 
 * @returns The contents of the page (jsx)
 */
function MainPageContent() {

  const imgStyle = { textAlign: "center"}

  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#424242",
        lGray: "#f3f3f3",
        contrastText: "#fff" //button text white instead of black
      },
      secondary: {
        main:"#f47920"
      },
      white: {
        main:"#ffffff"
      }
      
    },
    // overrides: {
    //   MuiButton: {
    //     raisedPrimary: {
    //       color: 'white',
    //       contrastText: "#fff" //button text white instead of black

    //     },
    //   },
    // }
  });


  return (
    <>
      <ThemeProvider theme = {theme}>
        <ResponsiveAppBar></ResponsiveAppBar>

      <div className="container my-5 ">{ /** This is an artifact from the old bootstrap code, may be deprecated */}


      
        <ProblemProvider url={reduxBaseUrl}>

          <div className="d-flex flex-column">

            <div className="p-2 col-example">
              <ProblemRowReact reduxBaseUrl={reduxBaseUrl}></ProblemRowReact>
            </div>
            <div className="p-2 col-example">

              <ReduceToRowReact reduxBaseUrl={reduxBaseUrl}></ReduceToRowReact>
            </div>

            <div className="p-2 col-example">
              <VisualizeRowReact reduxBaseUrl={reduxBaseUrl}></VisualizeRowReact>
            </div>
            
            <div className="p-2 col-example">
              <SolveRowReact reduxBaseUrl={reduxBaseUrl}></SolveRowReact>
            </div>
            <div className="p-2 col-example">

              <VerifyRowReact reduxBaseUrl={reduxBaseUrl}></VerifyRowReact>
            </div>
           
          </div>

        </ProblemProvider>
        </div>


        {/*<!-- /Container-->*/}

        {/* <footer className='fixed-bottom centered'> */}
        {/* </footer> */}
      </ThemeProvider>
        <Box

    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="10vh"
    // marginTop={'25%'}
    //Tried to push the logo down with the margin
  >
        <Image src={isulogo} height={125} width={500} ></Image>
    </Box>
    </>

  )
}

/**
 * Renders the actual page contents (this is the default export and is seen by next.js due to folder structure and broadcasted)
 * @returns A rendered page
 */
export default function MainPage() {
  return (
    <>
      <MainPageContent></MainPageContent> {/** Renders the actual contents of the page */}
    </>
  )
}

