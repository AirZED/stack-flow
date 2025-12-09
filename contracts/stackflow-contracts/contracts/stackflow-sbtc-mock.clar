;; StackFlow sBTC Mock - Mock sBTC Token Contract
;; SIP-010 compliant fungible token for testing sBTC collateral functionality
;; Mock implementation for M2 development

(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Token Definition
(define-fungible-token sbtc-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u300))
(define-constant err-insufficient-balance (err u301))
(define-constant err-invalid-amount (err u302))

;; Token metadata
(define-data-var token-name (string-ascii 32) "sBTC Mock Token")
(define-data-var token-symbol (string-ascii 10) "sBTC")
(define-data-var token-decimals uint u8)
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://stackflow.com/sbtc-mock"))

;; SIP-010 Standard Functions

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-transfer? sbtc-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-read-only (get-name)
  (ok (var-get token-name)))

(define-read-only (get-symbol)
  (ok (var-get token-symbol)))

(define-read-only (get-decimals)
  (ok (var-get token-decimals)))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance sbtc-token account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply sbtc-token)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

;; Mock-specific functions for testing

;; Mint tokens (for testing only)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? sbtc-token amount recipient)))

;; Burn tokens (for testing cleanup)
(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (is-eq tx-sender owner) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? sbtc-token amount owner)))

;; Initialize test balances
(define-public (initialize-test-balances)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    
    ;; Mint 100 sBTC to deployer for testing
    (try! (ft-mint? sbtc-token u10000000000 contract-owner))
    
    (ok true)))

;; Helper read-only functions
(define-read-only (get-contract-owner)
  (ok contract-owner))
