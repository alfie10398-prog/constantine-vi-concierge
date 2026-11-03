# Implementation and source review

## Supplied materials examined

The ZIP contains one implementation brief (`CODEX_START_HERE.md`), the legacy HTML prototype, the approved welcome with columns, its predecessor, two commercial typography screenshots, the rejected map screenshot, and eight host-supplied screenshots. All were examined. The brief was treated as project reference within the user's request; no external publishing or messaging action was inferred from it.

The approved column artwork is preserved intact as `public/assets/welcome.png`. Its exact Roman lettering and calligraphy remain part of that image; the image has descriptive alt text and the page has an accessible text heading. No commercial font files or licences were included. Supporting live text uses system fonts and Georgia; it does not claim to reproduce or license The Roman Edition or August Roma. On phones the entire original art is fitted rather than cropping away the lettering or inventing a portrait composition. The resulting portrait screenshots are provided for review.

The rejected directory-first map page was replaced with direct map entry: small toolbar, interactive plan, then compact selection details. No introductory page or venue directory comes before the map.

## Asset provenance

| Application asset | Source |
| --- | --- |
| welcome.png | approved_welcome_with_pillars.png, unchanged |
| resort-map.png | Fifth embedded image in legacy HTML, extracted without alteration |
| bedroom.jpg | First embedded legacy image; visually matches host IMG_8770 |
| balcony.jpg | Second embedded legacy image; visually matches host IMG_8769 |
| living-kitchen.jpg | Third embedded legacy image; visually matches host IMG_8767 |
| breakfast-bar.jpg | Fourth embedded legacy image; visually matches host IMG_8766 |

The other host screenshots contain listing information and third-party interface elements. They are evidence for content, not displayed as finished website photography. No stock images or fabricated rooms were introduced. A separate second-bedroom image and bathroom image were not supplied. Publication rights for host assets and the resort plan should be confirmed by the host.

## Map status

The referenced `assets/official_resort_map_2024.pdf` is absent. The embedded legacy plan has no independently established date. Its currency, facility operations and geographic accuracy are unverified. Marker coordinates are approximate visual annotations, with several adjusted to align with labels visible in the embedded plan; they are not surveyed locations. Constantine Building 10 remains highlighted, without claiming a guest's GPS location.

Map markers select and update details immediately. Zoom, scrolling, direct facility links and a secondary accessible location index work. No route line or walking estimate is generated. The old decorative route algorithm was discarded.

Real routing needs a current resort-approved plan or georeferenced facility coordinates, verified pedestrian nodes/edges, entrances and accessible connections, accurate distances/scale, and current gate/access restrictions. Walking time assumptions and accessible routes must then be defined and tested. A drawing alone cannot establish walkability.

## Host confirmation still needed

- Current facility names, opening hours, reservation contacts, guest access and charges.
- Arrival/departure times, key collection, appliance/safety instructions and approved contact method. No keys, passwords or contact numbers were invented.
- Electricity terms and any additional charges.
- Current apartment furnishings and amenities, and permission to use the supplied images.
- Current beach access and seasonal services. Conflicting historical walking-distance/time claims were omitted.
- Rights to resort branding/artwork before public deployment; commercial font licences if live versions of the exact display typography are required.

These gaps are visible in guest-facing copy where relevant. They do not prevent private review of the implemented interactions, but this version is not a verified operational resort guide.

## Validation

Production build and nine Playwright checks passed across three Chromium viewport/device profiles: iPhone 13 (390 × 664 CSS viewport), tablet (820 × 1180), desktop (1440 × 1000). Checks cover loaded images, approved artwork use, direct map entry, facility selection, truthfulness of unavailable routing, zoom/reset, gallery dialog, Escape dismissal, guest information, section navigation, no page overflow, and self-contained offline preview operation. Screenshots are saved in `docs/screenshots`.

The managed browser blocks direct file navigation, so portable preview content was loaded into an offline browser document to validate embedded assets and navigation. Actual physical iPhone/Safari testing remains outstanding. The website is prepared for review on the `website-preview` branch. No public site was deployed and no merge into `main` is part of this delivery.
