# Static Content Challenge

A little MVP CMS created with Node.js, Express.js and HTML 🤙

<br />

## Live demo

Live instance of the site is available [here](https://dw-static-content-challenge.herokuapp.com/)!

(Note - while there's a navbar at the top to access existing content on app start, there's also a secret markdown editor on `/new-content` URL which allows users to create new content files directly. It needs some work though sadly - see `things to improve on` section below)

Hosted with Heroku, which is set up to monitor any changes being pushed to `master` branch, at which point it'll pull the changes and redeploy the app. 

<br />

## Running locally

Assuming you have Git and Node.js installed, you can start this project locally with the following commands:

```sh
git clone https://github.com/dang-w/static-content-challenge.git
cd static-content-challenge
npm install
npm start
```

The server'll now be running and will serve the response files locally on [http://localhost:3001](http://localhost:3001)

<br />

## Available Scripts

### `npm start`

Runs the app in the development mode.

### `npm test`

Runs local unit tests.

<br />

## Things to improve on

As is the case in a lot of aspects of life, I didn't have as much time to devote to this as I would've liked.

It's also the first Node/Express app I've written from scratch in a while, so please forgive any best practices I haven't adhered to closely enough.

I've listed a number of different aspects (in no particular order) I think could be good to expand on in the future:

- I've added an inline markdown editor and filepath input so users can directly create new files, that are then added to the content directory and parsed along with the other, pre-existing content files. I like this idea in theory, but it needs some more work;
  - Input validation/sanitisation required for safety's sake; no XSS attacks pls & thx
  - File path input could be made a lot more robust - for instance, trimming any trailing `/` separators users might add, and sanitisation here too
  - Potentially some authorisation around who can access the editor - stop random users adding new content to the CMS
  - Page styling in general - my focus for this section was on getting the functionality working, a lot more custom styling could be done to it
  - The biggest issue I have with the current implementation is that while the new content file is created and parsed successfully (easier to see while running locally - check your `content` & `views/parsed-content` directories and watch the new files roll in 😎), since the content files are parsed, etc. at application start, new files added aren't visible correctly in the nav/directly through URL until the application has been restarted. I didn't have the time to find a solution to this I really liked, but would like to revisit

- File checking and sanitisation in general, potentially. I've added a check so only files with the `.md` extension get parsed and presented, but it would be good to ensure these all contain valid markdown and no embedded scripts, etc.

- Adding some linting would be useful

- Styling updates in general; I went for a clean look on the app, but there's a lot more could be done to make it look more polished. Also - the font may be a controversial choice, but it's literally called [Acme](https://fonts.google.com/specimen/Acme), so I felt compelled to use it.

- I'd like to expand the testing further - right now it covers basic routing and route handling in the app, but could expand it to cover the various util functions for more comprehensive coverage.

<br />
<hr />

**Thanks for reading folks - take it easy** 👋
