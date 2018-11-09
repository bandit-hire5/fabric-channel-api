
import app from './app';
console.log(process.env.PORT);
const PORT = 3000;

app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
});