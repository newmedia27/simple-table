import TablePlugin from "./plugin/TablePlugin"
import Button from "./lib/components/Button"

import iconLibrary from "./lib/utils/iconLIbrary"
import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import "./index.sass"
import App from "./App"
config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

iconLibrary()
const Wrapper = App

export { Wrapper, TablePlugin, Button }
