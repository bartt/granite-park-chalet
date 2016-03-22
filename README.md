# Granite Park Chalet

Checks the [availability of Granite Park Chalet](http://www.graniteparkchalet.com/vacancy_g.html) for availability on Aug 1-6. If there is lodging available on any of those days notify me by way of [Prowl](https://www.prowlapp.com/) and [Notify my Android](http://www.notifymyandroid.com/).

## Usage

Build a docker container:

```bash
docker build -t granite-park-chalet .
```
Deploy container and run it with API keys for Prowl and Notify my Android. Mount a volume to persist previously found availability so that you only get notified of changes in availability. Then point `PREV_AVAILABILITY_FILE` to a file on that mounted volume. Optionally include `chalet` in the DEBUG variable for debug information.

```bash
docker run -it --rm -v /Users/bartt/dev/glacier/:/tmp -e DEBUG=chalet -e PREV_AVAILABILITY_FILE=/tmp/prev-availability.json -e PROWL_API_KEY=<your prowl key> -e NMA_API_KEY=<your nma key> granite-park-chalet 
```

Use `cron` to check periodically for new availability and be notified.

## ISC License (ISC)

Copyright (c) 2016, Bart Teeuwisse

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
