;; Quantum Entanglement Simulator

;; Define data vars
(define-data-var contract-owner principal tx-sender)
(define-data-var next-pair-id uint u0)

;; Define data maps
(define-map entangled-pairs
  { pair-id: uint }
  { creator: principal, particle1: (optional uint), particle2: (optional uint), measured: bool })

(define-map user-pairs principal (list 100 uint))

;; Define constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PAIR-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-MEASURED (err u102))
(define-constant ERR-NOT-ENTANGLED (err u103))

;; Create an entangled pair
(define-public (create-entangled-pair)
  (let
    (
      (pair-id (var-get next-pair-id))
      (creator tx-sender)
    )
    (map-set entangled-pairs
      { pair-id: pair-id }
      { creator: creator, particle1: none, particle2: none, measured: false }
    )
    (var-set next-pair-id (+ pair-id u1))
    (let
      (
        (user-pair-list (default-to (list) (map-get? user-pairs creator)))
      )
      (map-set user-pairs
        creator
        (unwrap! (as-max-len? (append user-pair-list pair-id) u100) ERR-NOT-AUTHORIZED)
      )
    )
    (ok pair-id)
  )
)

;; Measure a particle in an entangled pair
(define-public (measure-particle (pair-id uint))
  (let
    (
      (pair (unwrap! (map-get? entangled-pairs { pair-id: pair-id }) ERR-PAIR-NOT-FOUND))
      (measured (get measured pair))
    )
    (asserts! (not measured) ERR-ALREADY-MEASURED)
    (let
      (
        (measurement (if (is-eq (mod block-height u2) u0) u0 u1))
        (new-pair (merge pair {
          particle1: (some measurement),
          particle2: (some (mod (+ measurement u1) u2)),
          measured: true
        }))
      )
      (map-set entangled-pairs { pair-id: pair-id } new-pair)
      (ok measurement)
    )
  )
)

;; Get the state of an entangled pair
(define-read-only (get-entangled-pair (pair-id uint))
  (ok (unwrap! (map-get? entangled-pairs { pair-id: pair-id }) ERR-PAIR-NOT-FOUND))
)

;; Get user's entangled pairs
(define-read-only (get-user-pairs (user principal))
  (ok (default-to (list) (map-get? user-pairs user)))
)

;; Verify entanglement (updated)
(define-read-only (verify-entanglement (pair-id uint))
  (let
    (
      (pair (unwrap! (map-get? entangled-pairs { pair-id: pair-id }) ERR-PAIR-NOT-FOUND))
      (particle1 (get particle1 pair))
      (particle2 (get particle2 pair))
    )
    (if (and (is-some particle1) (is-some particle2))
      (ok (not (is-eq (unwrap! particle1 ERR-NOT-ENTANGLED) (unwrap! particle2 ERR-NOT-ENTANGLED))))
      (ok false)
    )
  )
)

