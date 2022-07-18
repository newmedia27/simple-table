import iconLibrary from "./lib/utils/iconLIbrary"
import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
import "./index.sass"
import App from "./App"
import TablePlugin from "./plugin/TablePlugin"
import Button from "./lib/components/Button"

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
iconLibrary()

export { App as Wrapper, Button, TablePlugin }
