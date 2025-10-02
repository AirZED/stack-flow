;; StackFlow Options V1 - Bullish Strategies
;; Bitcoin-secured options trading on Stacks

(define-constant contract-owner tx-sender)
(define-constant ustx-per-stx u1000000)

;; Errors
(define-constant err-not-authorized (err u100))
(define-constant err-protocol-paused (err u101))
(define-constant err-invalid-amount (err u102))
(define-constant err-invalid-premium (err u103))
(define-constant err-invalid-expiry (err u104))
(define-constant err-option-not-found (err u105))
(define-constant err-not-owner (err u106))
(define-constant err-already-exercised (err u107))
(define-constant err-option-expired (err u108))
(define-constant err-not-in-the-money (err u109))
(define-constant err-not-expired (err u110))
(define-constant err-already-settled (err u111))
(define-constant err-invalid-strikes (err u112))

;; Data
(define-map options uint {owner: principal, strategy: (string-ascii 4), amount-ustx: uint, strike-price: uint, premium-paid: uint, created-at: uint, expiry-block: uint, is-exercised: bool, is-settled: bool})
(define-map user-options principal (list 500 uint))
(define-data-var option-nonce uint u0)
(define-data-var protocol-fee-bps uint u10)
(define-data-var protocol-wallet principal tx-sender)
(define-data-var paused bool false)
(define-data-var min-option-period uint u1008)
(define-data-var max-option-period uint u12960)

;; Helpers
(define-private (fee (p uint)) (/ (* p (var-get protocol-fee-bps)) u10000))
(define-private (valid-expiry (e uint)) (and (> e stacks-block-height) (>= (- e stacks-block-height) (var-get min-option-period)) (<= (- e stacks-block-height) (var-get max-option-period))))
(define-private (add-user-option (u principal) (id uint)) (map-set user-options u (unwrap-panic (as-max-len? (append (default-to (list) (map-get? user-options u)) id) u500))))
(define-private (call-payout (s uint) (a uint) (p uint) (c uint)) (if (> c s) (let ((d (- c s)) (g (/ (* d a) ustx-per-stx))) (if (> g p) (- g p) u0)) u0))

;; Reads
(define-read-only (get-option (id uint)) (map-get? options id))
(define-read-only (get-user-options (u principal)) (default-to (list) (map-get? user-options u)))
(define-read-only (get-stats) {total: (var-get option-nonce), fee: (var-get protocol-fee-bps), paused: (var-get paused)})

;; Create CALL
(define-public (create-call-option (amt uint) (strike uint) (prem uint) (exp uint))
  (let ((id (+ (var-get option-nonce) u1)) (f (fee prem)) (tot (+ prem f)))
    (asserts! (not (var-get paused)) err-protocol-paused)
    (asserts! (and (> amt u0) (> prem u0) (> strike u0)) err-invalid-amount)
    (asserts! (valid-expiry exp) err-invalid-expiry)
    (try! (stx-transfer? tot tx-sender (as-contract tx-sender)))
    (try! (as-contract (stx-transfer? f tx-sender (var-get protocol-wallet))))
    (map-set options id {owner: tx-sender, strategy: "CALL", amount-ustx: amt, strike-price: strike, premium-paid: prem, created-at: stacks-block-height, expiry-block: exp, is-exercised: false, is-settled: false})
    (add-user-option tx-sender id)
    (var-set option-nonce id)
    (print {event: "created", id: id, strategy: "CALL"})
    (ok id)))

;; Create STRAP
(define-public (create-strap-option (amt uint) (strike uint) (prem uint) (exp uint))
  (let ((id (+ (var-get option-nonce) u1)) (f (fee prem)) (tot (+ prem f)))
    (asserts! (not (var-get paused)) err-protocol-paused)
    (asserts! (and (> amt u0) (> prem u0) (> strike u0)) err-invalid-amount)
    (asserts! (valid-expiry exp) err-invalid-expiry)
    (try! (stx-transfer? tot tx-sender (as-contract tx-sender)))
    (try! (as-contract (stx-transfer? f tx-sender (var-get protocol-wallet))))
    (map-set options id {owner: tx-sender, strategy: "STRP", amount-ustx: amt, strike-price: strike, premium-paid: prem, created-at: stacks-block-height, expiry-block: exp, is-exercised: false, is-settled: false})
    (add-user-option tx-sender id)
    (var-set option-nonce id)
    (print {event: "created", id: id, strategy: "STRP"})
    (ok id)))

;; Create Bull Call Spread
(define-public (create-bull-call-spread (amt uint) (lo uint) (hi uint) (prem uint) (exp uint))
  (let ((id (+ (var-get option-nonce) u1)) (f (fee prem)) (tot (+ prem f)))
    (asserts! (not (var-get paused)) err-protocol-paused)
    (asserts! (< lo hi) err-invalid-strikes)
    (asserts! (valid-expiry exp) err-invalid-expiry)
    (let ((w (- hi lo)))
      (try! (stx-transfer? tot tx-sender (as-contract tx-sender)))
      (try! (as-contract (stx-transfer? f tx-sender (var-get protocol-wallet))))
      (map-set options id {owner: tx-sender, strategy: "BCSP", amount-ustx: w, strike-price: lo, premium-paid: prem, created-at: stacks-block-height, expiry-block: exp, is-exercised: false, is-settled: false})
      (add-user-option tx-sender id)
      (var-set option-nonce id)
      (print {event: "created", id: id, strategy: "BCSP"})
      (ok id))))

;; Create Bull Put Spread
(define-public (create-bull-put-spread (amt uint) (lo uint) (hi uint) (coll uint) (exp uint))
  (let ((id (+ (var-get option-nonce) u1)))
    (asserts! (not (var-get paused)) err-protocol-paused)
    (asserts! (< lo hi) err-invalid-strikes)
    (asserts! (valid-expiry exp) err-invalid-expiry)
    (let ((w (- hi lo)))
      (try! (stx-transfer? coll tx-sender (as-contract tx-sender)))
      (map-set options id {owner: tx-sender, strategy: "BPSP", amount-ustx: w, strike-price: hi, premium-paid: coll, created-at: stacks-block-height, expiry-block: exp, is-exercised: false, is-settled: false})
      (add-user-option tx-sender id)
      (var-set option-nonce id)
      (print {event: "created", id: id, strategy: "BPSP"})
      (ok id))))

;; Exercise
(define-public (exercise-option (id uint) (price uint))
  (let ((opt (unwrap! (map-get? options id) err-option-not-found)))
    (asserts! (is-eq (get owner opt) tx-sender) err-not-owner)
    (asserts! (not (get is-exercised opt)) err-already-exercised)
    (asserts! (< stacks-block-height (get expiry-block opt)) err-option-expired)
    (let ((payout (call-payout (get strike-price opt) (get amount-ustx opt) (get premium-paid opt) price)))
      (asserts! (> payout u0) err-not-in-the-money)
      (map-set options id (merge opt {is-exercised: true}))
      (try! (as-contract (stx-transfer? payout tx-sender (get owner opt))))
      (print {event: "exercised", id: id, payout: payout})
      (ok payout))))

;; Admin
(define-public (pause-protocol) (begin (asserts! (is-eq tx-sender contract-owner) err-not-authorized) (var-set paused true) (ok true)))
(define-public (unpause-protocol) (begin (asserts! (is-eq tx-sender contract-owner) err-not-authorized) (var-set paused false) (ok true)))
(define-public (set-protocol-fee (n uint)) (begin (asserts! (is-eq tx-sender contract-owner) err-not-authorized) (asserts! (<= n u1000) (err u999)) (var-set protocol-fee-bps n) (ok true)))
(define-public (set-protocol-wallet (w principal)) (begin (asserts! (is-eq tx-sender contract-owner) err-not-authorized) (var-set protocol-wallet w) (ok true)))

