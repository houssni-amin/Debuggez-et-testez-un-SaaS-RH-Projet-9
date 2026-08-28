/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

import router from "../app/Router.js"
import Bills from "../containers/Bills.js"

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock })
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				}),
			)
			const root = document.createElement("div")
			root.setAttribute("id", "root")
			document.body.append(root)
			router()
			window.onNavigate(ROUTES_PATH.Bills)
			await waitFor(() => screen.getByTestId("icon-window"))
			const windowIcon = screen.getByTestId("icon-window")

			// Vérification que windowIcon possède bien la classe active-icon
			expect(windowIcon.classList.contains("active-icon")).toBe(true)
		})
		test("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills })
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
				)
				.map((a) => a.innerHTML)
			const antiChrono = (a, b) => (a < b ? 1 : -1)
			const datesSorted = [...dates].sort(antiChrono)
			expect(dates).toEqual(datesSorted)
		})

		test("fetches bills from mock API GET", async () => {
			// Simulation d'un utilisateur connecté (Employé) dans le localStorage
			localStorage.setItem(
				"user",
				JSON.stringify({ type: "Employee", email: "a@a" }),
			)

			// Création et injection du conteneur dans le DOM
			const root = document.createElement("div")
			root.setAttribute("id", "root")
			document.body.append(root)
			router()

			// Navigation vers la page Bills et attente du chargement de la page
			window.onNavigate(ROUTES_PATH.Bills)
			await waitFor(() => screen.getByText("Mes notes de frais"))

			// Vérification de la présence des factures simulées à l'écran
			const firstBillType = await screen.getByText("Restaurants et bars")
			expect(firstBillType).toBeTruthy()

			const secondBillType = await screen.getByText("Hôtel et logement")
			expect(secondBillType).toBeTruthy()

			const thirdBillType = await screen.getByText("Transports")
			expect(thirdBillType).toBeTruthy()
		})

		describe("when I click on the new bill button", () => {
			test("then I should be redirected to new bills page", () => {
				// Surveillance de la fonction de navigation
				const onNavigate = jest.fn()

				// Génération de l'interface utilisateur de la page Bills
				document.body.innerHTML = BillsUI({ data: bills })

				// Initialisation du contrôleur de la page
				new Bills({
					document,
					onNavigate,
					store: null,
					localStorage: window.localStorage,
				})

				// Ciblage du bouton "Nouvelle note de frais" dans le DOM
				const button = screen.getByTestId("btn-new-bill")

				// Simulation du clic utilisateur sur ce bouton
				fireEvent.click(button)

				// Vérification : Confirmation que l'app a bien navigué vers la route "NewBill"
				expect(onNavigate).toHaveBeenLastCalledWith(ROUTES_PATH["NewBill"])
			})
		})

		describe("when I click on the iconEye button", () => {
			test("then the modale should open with the picture", () => {
				document.body.innerHTML = BillsUI({ data: bills })
				new Bills({
					document,
					onNavigate,
					store: null,
					localStorage: window.localStorage,
				})
				const button = screen.getAllByTestId("icon-eye")
				$.fn.modal = jest.fn()
				fireEvent.click(button[0])
				expect($.fn.modal).toHaveBeenLastCalledWith("show")
			})
		})

		describe("when the API returns a valid bills", () => {
			test("then bills should be formatted correctly", async () => {
				const mockStore = {
					bills: () => ({
						list: () => {
							return Promise.resolve(bills)
						},
					}),
				}
				const billsInit = new Bills({
					document,
					onNavigate,
					store: mockStore,
					localStorage: window.localStorage,
				})
				const result = await billsInit.getBills()
				expect(result).toHaveLength(bills.length)
			})
		})
	})
})
