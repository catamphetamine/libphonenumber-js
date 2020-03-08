---
name: Bug report
about: Reporting bugs
title: ''
labels: ''
assignees: catamphetamine

---

## Steps to reproduce

Describe the clear steps to reproduce the issue.

## Observed result

What's the observed result?

## Expected result

What's the expected result?

If the expected result is `.isValid()` returning `false` but it returns `true` in your code and at the same time it shows `false` on the demo page, then it means that your code uses non-`max` metadata. See the readme for more info on `min` vs `max`.

## Google's demo link

If it's a validation/parsing/formatting/AsYouType bug, then post a link to [Google's `libphonenumber` demo page](https://libphonenumber.appspot.com/) illustrating the correct behaviour. If Google's demo result is the same as this library's result, then submit an issue in [Google's repo](https://github.com/google/libphonenumber#quick-links).

For example, for an Australian number `438 331 999` Google's demo link [looks like this](https://libphonenumber.appspot.com/phonenumberparser?number=438331999&country=AU) and provides all info — "Parsing Result", "Validation Results", "Formatting Results" and "AsYouTypeFormatter Results".
