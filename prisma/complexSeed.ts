import { runCurrentSeed } from "./seed"

runCurrentSeed()
  .then(() => {
    console.log("Complex seed delegated to the current schema seed")
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
